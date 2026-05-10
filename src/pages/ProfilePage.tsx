import { useState } from 'react';
import { LogOut, User, Crown, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { logoutUser, db } from '../lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import PaymentModal from '../components/PaymentModal';

export default function ProfilePage() {
  const { user, appUser } = useStore();
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
  };

  const handlePremiumAction = async () => {
    if (!user || !appUser) return;
    
    if (appUser.isPremium) {
      // Manage / Cancel subscription logic (Mock for now)
      try {
        toast.loading("Processing cancellation...", { id: 'prem' });
        await updateDoc(doc(db, 'users', user.uid), {
          isPremium: false
        });
        useStore.setState({ appUser: { ...appUser, isPremium: false } });
        toast.success("Premium Canceled", { id: 'prem' });
      } catch(e) {
        toast.error("Failed to cancel", { id: 'prem' });
      }
    } else {
      // Open Payment Modal
      setPaymentModalOpen(true);
    }
  }

  return (
    <div className="p-6 pt-12 h-full flex flex-col relative z-10 w-full overflow-hidden">
      
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} />

      <div className="flex flex-col items-center mb-8 relative">
        <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-black shadow-[0_0_0_2px_rgba(255,0,127,0.5)] overflow-hidden mb-4 relative z-10">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-full h-full p-4 text-gray-500" />
          )}
        </div>
        <h2 className="text-xl font-bold">{user?.displayName || 'User'}</h2>
        <p className="text-sm text-gray-400">{user?.email}</p>
        
        {appUser?.isPremium && (
          <div className="absolute top-0 right-1/4 translate-x-4 -translate-y-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,0,127,0.8)] z-20 flex items-center gap-1">
             <Crown className="w-3 h-3" /> PRO
          </div>
        )}
      </div>

      <div className="space-y-4">
        
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">TokBoost Premium <Crown className="w-4 h-4 text-yellow-500"/></h3>
            <p className="text-xs text-gray-400">Unlimited generations, no ads</p>
          </div>
          <button 
            onClick={handlePremiumAction}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${appUser?.isPremium ? 'bg-gray-800 text-white border border-gray-700' : 'bg-pink-600 text-white shadow-[0_0_15px_rgba(255,0,127,0.5)]'}`}
          >
            {appUser?.isPremium ? 'Manage' : 'Upgrade'}
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <MenuRow icon={SettingsIcon} label="Settings" onClick={() => toast("Settings coming soon")} />
          <div className="h-px bg-gray-800 mx-4" />
          <MenuRow icon={AlertCircle} label="Privacy Policy" onClick={() => toast("Privacy Policy")} />
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-8 active:scale-95 transition-transform"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>

      </div>
      
      <p className="text-center text-xs text-gray-600 mt-auto pt-8 pb-4">TokBoost AI v1.0.0</p>
    </div>
  );
}

function MenuRow({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors text-left">
      <Icon className="w-5 h-5 text-gray-400" />
      <span className="font-medium flex-1">{label}</span>
    </button>
  );
}
