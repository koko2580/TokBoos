import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebase/config';
import { showInterstitialAd } from './lib/admob';

interface AppUser {
  coins: number;
  isPremium: boolean;
  lastCoinClaim: string | null;
}

interface AppState {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  isLoading: boolean;
  isAdVisible: boolean;
  onAdComplete: (() => void) | null;
  generationsCount: number;
  setUser: (user: FirebaseUser | null) => void;
  fetchAppUser: (uid: string) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;
  claimDailyCoins: () => Promise<boolean>;
  showAdOverlay: (onComplete?: () => void) => void;
  closeAdOverlay: () => void;
  triggerGenerationAd: (onAdDone: () => void, skipAd: () => void) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  appUser: null,
  isLoading: true,
  isAdVisible: false,
  onAdComplete: null,
  generationsCount: 0,
  setUser: (user) => set({ user }),
  
  showAdOverlay: (onComplete) => set({ isAdVisible: true, onAdComplete: onComplete || null }),
  
  closeAdOverlay: () => {
    const { onAdComplete } = get();
    set({ isAdVisible: false, onAdComplete: null });
    if (onAdComplete) onAdComplete();
  },
  
  triggerGenerationAd: async (onAdDone, skipAd) => {
    const { generationsCount, appUser } = get();
    if (appUser?.isPremium) {
      skipAd();
      return;
    }
    const newCount = generationsCount + 1;
    set({ generationsCount: newCount });
    // Show ad every 3 generations
    if (newCount % 3 === 0) {
      // In web this will just mock, in Android it shows real interstitial
      await showInterstitialAd();
      onAdDone();
    } else {
      skipAd();
    }
  },
  
  fetchAppUser: async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        set({ appUser: userSnap.data() as AppUser });
      } else {
        // Create new user profile
        const newUser: AppUser = {
          coins: 50,
          isPremium: false,
          lastCoinClaim: new Date().toISOString(),
        };
        await setDoc(userRef, newUser);
        set({ appUser: newUser });
      }
    } catch (error) {
      console.error("Failed to fetch app user", error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  deductCoins: async (amount: number) => {
    const { user, appUser } = get();
    if (!user || !appUser) return false;
    
    // Premium users don't use coins
    if (appUser.isPremium) return true;
    
    if (appUser.coins < amount) return false;
    
    const newCoins = appUser.coins - amount;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { coins: newCoins });
      set({ appUser: { ...appUser, coins: newCoins } });
      return true;
    } catch (e) {
      console.error("Failed to deduct coins", e);
      return false;
    }
  },

  claimDailyCoins: async () => {
    const { user, appUser } = get();
    if (!user || !appUser) return false;
    
    const userRef = doc(db, 'users', user.uid);
    const newCoins = appUser.coins + 20;
    try {
      await updateDoc(userRef, { 
        coins: newCoins,
        lastCoinClaim: new Date().toISOString()
      });
      set({ appUser: { ...appUser, coins: newCoins, lastCoinClaim: new Date().toISOString() } });
      return true;
    } catch (e) {
      console.error("Failed to claim coins", e);
      return false;
    }
  }
}));
