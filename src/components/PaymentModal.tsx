import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';
import { useStore } from '../store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { toast } from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user, appUser } = useStore();

  const handlePayment = async () => {
    if (!user || !appUser) return;
    
    setLoading(true);
    
    // Simulate real payment processing time
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          isPremium: true
        });
        useStore.setState({ appUser: { ...appUser, isPremium: true } });
        setSuccess(true);
        setLoading(false);
        toast.success("Welcome to TokBoost PRO!");
        
        // Auto close after confetti
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 4000);
      } catch (error) {
        setLoading(false);
        toast.error("Payment failed. Please try again.");
      }
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          {success && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#FF007F', '#00F0FF', '#ffffff']} />}
          
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm overflow-hidden relative shadow-[0_0_50px_rgba(255,0,127,0.15)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            
            {!success ? (
              <>
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      TokBoost <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">PRO</span>
                      <Sparkles className="w-5 h-5 text-pink-500" />
                    </h2>
                    <button onClick={onClose} disabled={loading} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="bg-black/50 border border-pink-500/30 rounded-2xl p-5 mb-6 backdrop-blur-md">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Lifetime Access</p>
                        <h3 className="text-3xl font-black text-white">$4.99<span className="text-sm font-normal text-gray-500"> / once</span></h3>
                      </div>
                    </div>
                    
                    <ul className="space-y-3">
                      {['Unlimited AI Generations', 'Zero Advertisements', 'Premium Profile Badge', 'Priority New Features'].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-200 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                      <div className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Google Play Billing</p>
                        <p className="text-sm font-bold text-white">1-Click Purchase</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-4">
                  <button 
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,127,0.4)] active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 relative overflow-hidden"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Secure Checkout
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-gray-500 mt-4 leading-relaxed">
                    By confirming, you agree to our Terms of Service. Note: This preview simulates a real transaction. 
                  </p>
                </div>
              </>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.5)]"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-2">Payment Successful!</h2>
                <p className="text-gray-400 text-sm">You are now a TokBoost PRO member. Enjoy unlimited access.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
