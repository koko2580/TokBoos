import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { TrendingUp, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const q = query(collection(db, 'trends'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (data.length === 0) {
          // Mock data if Firestore is empty
          setTrends([
            { id: '1', title: '#POV', category: 'General', description: 'Show a specific point of view.' },
            { id: '2', title: 'Pedro Pedro Pedro', category: 'Audio', description: 'Racoon dancing.' },
            { id: '3', title: 'GRWM', category: 'Lifestyle', description: 'Get ready with me.' },
          ]);
        } else {
          setTrends(data);
        }
      } catch (e) {
         setTrends([
            { id: '1', title: '#GamingSetup', category: 'Gaming', description: 'Show off your rig.' },
            { id: '2', title: 'Sad Edit Audio', category: 'Anime', description: 'Slowed down sad songs.' },
         ]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  return (
    <div className="p-6 pt-12 max-w-2xl mx-auto h-full flex flex-col relative z-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-cyan-500/20 rounded-xl">
          <TrendingUp className="text-cyan-400 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Trending Now</h1>
          <p className="text-xs text-gray-400">Discover what's viral</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>
      ) : (
        <div className="space-y-4">
          {trends.map((t, i) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-500 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  {t.category}
                </span>
                <button className="text-gray-400 hover:text-white transition"><Copy className="w-4 h-4"/></button>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 relative z-10">{t.title}</h3>
              <p className="text-sm text-gray-400 relative z-10">{t.description}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
