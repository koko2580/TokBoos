import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function SplashPage() {
  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center relative">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-[60px]" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-400/20 rounded-full blur-[60px]" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-600 to-cyan-500 p-1 shadow-[0_0_30px_rgba(255,0,127,0.5)] mb-6">
          <div className="w-full h-full bg-black rounded-[22px] flex items-center justify-center">
            <Zap className="w-12 h-12 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="currentColor" />
          </div>
        </div>
        <motion.h1 
          className="text-4xl font-black italic tracking-tighter"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Tok</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">Boost</span>
          <span className="text-white ml-2 text-2xl">AI</span>
        </motion.h1>
      </motion.div>
    </div>
  );
}
