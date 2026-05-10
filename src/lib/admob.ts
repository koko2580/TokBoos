import { AdMob, AdOptions, BannerAdOptions, BannerAdPosition, BannerAdSize, RewardAdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { useStore } from '../store';

export const AD_IDS = {
  banner: 'ca-app-pub-5984576938417142/2994020841',
  interstitial: 'ca-app-pub-5984576938417142/3117455560',
  rewarded: 'ca-app-pub-5984576938417142/5620184189',
};

export async function initializeAdMob() {
  if (Capacitor.isNativePlatform()) {
    try {
      await AdMob.initialize({
        // @ts-ignore
        requestTrackingAuthorization: true,
        testingDevices: [],
        initializeForTesting: false,
      });
    } catch (e) {
      console.error("AdMob Init Error", e);
    }
  }
}


export async function showBannerAd() {
  if (Capacitor.isNativePlatform()) {
    const options: BannerAdOptions = {
      adId: AD_IDS.banner,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false,
    };
    try {
      await AdMob.showBanner(options);
    } catch (e) {
      console.error("Banner Error", e);
    }
  }
}

export async function hideBannerAd() {
  if (Capacitor.isNativePlatform()) {
      try {
          await AdMob.hideBanner();
      } catch (e) {
          console.error(e);
      }
  }
}

/**
 * Interstitial ads are shown throughout the app periodically.
 */
export async function showInterstitialAd(): Promise<void> {
  return new Promise(async (resolve) => {
    if (Capacitor.isNativePlatform()) {
      const options: AdOptions = {
        adId: AD_IDS.interstitial,
        isTesting: false,
      };
      try {
        await AdMob.prepareInterstitial(options);
        // @ts-ignore
        AdMob.addListener('onAdDismissedFullScreenContent', () => {
            resolve();
        });
        await AdMob.showInterstitial();
      } catch (e) {
        console.error("Interstitial Error", e);
        resolve(); // resolve anyway so app continues
      }
    } else {
      // Simulate for Web
      console.log("Simulated Interstitial Ad:", AD_IDS.interstitial);
      resolve();
    }
  });
}

/**
 * Rewarded ads give coins when watched.
 */
export async function showRewardedAd(onReward: () => void, onCloseMap: () => void): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const options: RewardAdOptions = {
      adId: AD_IDS.rewarded,
      isTesting: false,
    };
    
    // @ts-ignore
    AdMob.addListener('onRewardedVideoAdReward', () => {
      onReward();
    });
    
    // @ts-ignore
    AdMob.addListener('onRewardedVideoAdDismissed', () => {
      onCloseMap();
    });
    
    try {
      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
    } catch (e) {
      console.error("Rewarded Error", e);
      onCloseMap(); // ensure closing
    }
  } else {
    // Web Fallback: showing our mock overlay to prevent breaking UX in preview
    useStore.getState().showAdOverlay(() => {
      onReward();
      onCloseMap();
    });
  }
}
