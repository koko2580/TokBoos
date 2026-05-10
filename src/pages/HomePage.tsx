import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Hash, Edit3, Video, Play, Gem, Coins } from 'lucide-react';
import { useStore } from '../store';
import { toast } from 'react-hot-toast';
import { showRewardedAd } from '../lib/admob';

export default function HomePage() {
  const navigate = useNavigate();
  const { appUser } = useStore();

  const tools = [
    { id: 'caption', name: 'Caption Generator', icon: Edit3, color: 'from-pink-500 to-rose-400', desc: 'Viral hooks & engaging texts' },
    { id: 'hashtag', name: 'Trending Hashtags', icon: Hash, color: 'from-cyan-400 to-blue-500', desc: 'Algorithm friendly tags' },
    { id: 'bio', name: 'Aesthetic Bios', icon: Sparkles, color: 'from-purple-500 to-pink-500', desc: 'Profile makeovers' },
    { id: 'idea', name: 'Video Ideas', icon: Video, color: 'from-amber-400 to-orange-500', desc: 'Never run out of content' },
  ];

  const handleWatchAd = () => {
    toast.loading("Loading Rewarded Ad...", { id: 'ad' });
    showRewardedAd(
      () => {
        // On reward
        useStore.getState().claimDailyCoins().then((success) => {
          if (success) toast.success("Coins rewarded!");
        });
      },
      () => {
        // On close
        toast.dismiss('ad');
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-6 relative z-10 pt-12"
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black italic tracking-tight">Tok<span className="text-pink-500">Boost</span></h1>
          <p className="text-xs text-gray-400">Creator Toolkit</p>
        </div>
        <div className="flex gap-2">
          {appUser?.isPremium ? (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-pink-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Gem className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-pink-400">PRO</span>
            </div>
          ) : (
            <div className="bg-black/50 border border-cyan-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
              <Coins className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400">{appUser?.coins || 0}</span>
            </div>
          )}
        </div>
      </header>

      {/* Ad Banner for Coins */}
      {!appUser?.isPremium && (
        <motion.div 
          onClick={handleWatchAd}
          className="w-full bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-4 mb-8 flex justify-between items-center shadow-lg active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <Play className="w-5 h-5 text-yellow-400" fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Watch Ad for 20 Coins</h3>
              <p className="text-xs text-gray-400">Free daily generations</p>
            </div>
          </div>
          <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full">
            Watch
          </button>
        </motion.div>
      )}

      <h2 className="text-lg font-bold mb-4">AI Generators</h2>
      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <motion.button
              key={tool.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/tools/${tool.id}`)}
              className="bg-gray-900/60 border border-white/5 rounded-2xl p-4 flex flex-col items-start text-left active:scale-[0.98] transition-transform backdrop-blur-sm"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm mb-1">{tool.name}</h3>
              <p className="text-[10px] text-gray-400 leading-tight">{tool.desc}</p>
            </motion.button>
          );
        })}
      </div>

    </motion.div>
  );
}
