import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { TrendingUp, Copy, ExternalLink, Loader2, Music, Hash, Wand2, Flame, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useStore } from '../store';

const MOCK_TRENDS = [
  { id: '1', title: 'Pedro Pedro Pedro', category: 'Audio', description: 'Raccoon dancing to a techno remix. Used in random relatable scenarios.', views: '1.2B', growth: '+450%', icon: Music, color: 'from-blue-500 to-indigo-500' },
  { id: '2', title: '#POV', category: 'Hashtag', description: 'Show a specific point of view. Highly engaging format.', views: '45.1B', growth: '+12%', icon: Hash, color: 'from-cyan-400 to-blue-500' },
  { id: '3', title: 'Sad Edit Audio', category: 'Audio', description: 'Slowed down sad songs, often used with anime or movie scenes.', views: '800M', growth: '+85%', icon: Music, color: 'from-blue-500 to-indigo-500' },
  { id: '4', title: 'Anime Filter', category: 'Effect', description: 'Turns you or your pet into a 90s anime character.', views: '2.1B', growth: '+210%', icon: Wand2, color: 'from-purple-500 to-pink-500' },
  { id: '5', title: 'GRWM', category: 'General', description: 'Get ready with me. Timeless format for storytelling.', views: '12.4B', growth: '+5%', icon: Play, color: 'from-amber-400 to-orange-500' },
  { id: '6', title: '#GamingSetup', category: 'Hashtag', description: 'Show off your PC rig and room aesthetics.', views: '3.4B', growth: '+45%', icon: Hash, color: 'from-cyan-400 to-blue-500' },
];

const CATEGORIES = ['All', 'Audio', 'Hashtag', 'Effect', 'General'];

export default function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const { language } = useStore();

  const text = {
    title: language === 'my' ? 'ရေပန်းစားမှုများ' : 'Trending Now',
    desc: language === 'my' ? 'ယနေ့လူကြည့်များသော အရာများ' : "Discover what's viral today",
    views: language === 'my' ? 'ကြည့်ရှုသူ' : 'views',
    growth: language === 'my' ? 'တိုးတက်မှု' : 'growth',
    copied: language === 'my' ? 'ကူးယူပီးပါပြီ' : 'Copied to clipboard!',
  };


  useEffect(() => {
    async function fetchTrends() {
      try {
        const q = query(collection(db, 'trends'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (data.length === 0) {
          setTrends(MOCK_TRENDS);
        } else {
          // If using real data, map it to our format
          const formatted = data.map((d: any) => ({
             ...d,
             views: d.views || '1M+',
             growth: d.growth || '+10%',
             icon: d.category === 'Audio' ? Music : d.category === 'Effect' ? Wand2 : d.category === 'Hashtag' ? Hash : Play,
             color: d.category === 'Audio' ? 'from-blue-500 to-indigo-500' : d.category === 'Effect' ? 'from-purple-500 to-pink-500' : d.category === 'Hashtag' ? 'from-cyan-400 to-blue-500' : 'from-amber-400 to-orange-500'
          }));
          setTrends(formatted);
        }
      } catch (e) {
         setTrends(MOCK_TRENDS);
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  const handleCopy = (textValue: string) => {
    navigator.clipboard.writeText(textValue);
    toast.success(text.copied);
  };

  const filteredTrends = activeTab === 'All' 
    ? trends 
    : trends.filter(t => t.category === activeTab);

  return (
    <div className="p-6 pt-12 max-w-2xl mx-auto h-full flex flex-col relative z-10 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-display tracking-tight">{text.title}</h1>
            <p className="text-xs text-cyan-400 font-medium">{text.desc}</p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === cat 
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>
      ) : (
        <div className="space-y-4 overflow-y-auto no-scrollbar pb-10">
          <AnimatePresence mode="popLayout">
            {filteredTrends.map((t, i) => {
              const Icon = t.icon || Play;
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                  transition={{ delay: i * 0.05 }}
                  key={t.id}
                  className="bg-black/40 border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group"
                >
                  <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${t.color || 'from-white/10'} opacity-20 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-40`} />
                  
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${t.color || 'from-gray-500'} bg-opacity-20`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-300">
                        {t.category}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleCopy(t.title)}
                      className="text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-all"
                    >
                      <Copy className="w-4 h-4"/>
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 relative z-10">{t.title}</h3>
                  <p className="text-sm text-gray-400 relative z-10 mb-4">{t.description}</p>
                  
                  <div className="flex items-center gap-4 relative z-10 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-1">
                      <Play className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-300">{t.views} {text.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-bold text-orange-400">{t.growth} {text.growth}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
