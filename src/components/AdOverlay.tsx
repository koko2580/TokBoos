import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle } from 'lucide-react';
import { useStore } from '../store';

export default function AdOverlay() {
  const { isAdVisible, closeAdOverlay } = useStore();
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isAdVisible) {
      setTimeLeft(5);
      setCanClose(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdVisible]);

  const handleClose = () => {
    if (canClose) {
      closeAdOverlay();
    }
  };

  return (
    <AnimatePresence>
      {isAdVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 z-[100] flex flex-col bg-black overflow-hidden"
        >
          {/* Fake Video Ad Content */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black animate-pulse opacity-80" />
          
          {/* Ad Sponsor Notice */}
          <div className="absolute top-4 left-4 z-20">
             <div className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-black uppercase rounded shadow-lg">
               Sponsored
             </div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6 text-center">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-3xl mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(255,0,127,0.5)]"
            >
              <PlayCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Level Up Your Brand</h2>
            <p className="text-gray-300 max-w-[250px] leading-relaxed text-sm">
               Get massive engagement with incredible AI tools. Unlock the full potential of your social media.
            </p>
            <button className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full animate-bounce">
              Learn More
            </button>
          </div>
          
          {/* Close / Timer Button */}
          <div className="absolute top-4 right-4 z-20">
            {canClose ? (
              <button 
                onClick={handleClose} 
                className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 text-white backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <div className="px-4 py-2 bg-black/50 text-white rounded-full text-xs font-bold border border-white/20 backdrop-blur-md">
                Reward in {timeLeft}s
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full z-20">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-pink-500" 
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
