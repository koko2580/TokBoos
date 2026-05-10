import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useStore } from '../store';
import { Bookmark, Copy, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function FavoritesPage() {
  const { user } = useStore();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadFaves() {
      try {
        const q = query(collection(db, 'users', user!.uid, 'favorites'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setFavorites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Favorites error", e);
      } finally {
        setLoading(false);
      }
    }
    loadFaves();
  }, [user]);

  const handleDelete = async (id: string) => {
    if(!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'favorites', id));
      setFavorites(f => f.filter(x => x.id !== id));
      toast.success("Removed from saved.");
    } catch(e) {
      toast.error("Failed to delete.");
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  }

  return (
    <div className="p-6 pt-12 max-w-2xl mx-auto h-full flex flex-col relative z-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-pink-500/20 rounded-xl">
          <Bookmark className="text-pink-500 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Saved</h1>
          <p className="text-xs text-gray-400">Your favorite generations</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No saved items yet.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          <AnimatePresence>
            {favorites.map((f) => (
              <motion.div 
                key={f.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-pink-500 bg-pink-950/50 px-2 py-0.5 rounded">
                    {f.type}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => copyText(f.content)} className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-lg"><Copy className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap text-gray-200">{f.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
