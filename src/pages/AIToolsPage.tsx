import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, Save, Loader2, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store';
import { generateCaption, generateHashtags, generateBio, generateVideoIdea } from '../lib/gemini';
import { db } from '../lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export default function AIToolsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const isRoot = location.pathname === '/tools' || location.pathname === '/tools/';

  if (isRoot) {
    // If they click AI tools directly, just show the list
    return (
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold mb-6">AI Generation Tools</h1>
        <div className="flex flex-col gap-4">
          <ToolCard title="Caption Generator" path="caption" desc="Write viral hooks" color="bg-pink-500" />
          <ToolCard title="Hashtag Generator" path="hashtag" desc="Find trending tags" color="bg-cyan-400" />
          <ToolCard title="Bio Generator" path="bio" desc="Aesthetic profile bios" color="bg-purple-500" />
          <ToolCard title="Video Ideas" path="idea" desc="Never run out of content" color="bg-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative flex flex-col pt-8">
      {/* Universal header for tools */}
      <div className="flex items-center px-4 py-4 border-b border-white/10 z-20 bg-black/80 backdrop-blur-md sticky top-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-2 font-bold text-lg capitalize">{location.pathname.split('/').pop()} Generator</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <Routes>
          <Route path="caption" element={<CaptionTool />} />
          <Route path="hashtag" element={<HashtagTool />} />
          <Route path="bio" element={<BioTool />} />
          <Route path="idea" element={<IdeaTool />} />
        </Routes>
      </div>
    </div>
  );
}

function ToolCard({ title, path, desc, color }: { title: string, path: string, desc: string, color: string }) {
  const nav = useNavigate();
  return (
    <div onClick={() => nav(path)} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98]">
      <div className={`w-3 h-12 rounded-full ${color}`} />
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

const GENERATION_COST = 5;

// === INDIVIDUAL TOOLS ===

function CaptionTool() {
  const [topic, setTopic] = useState('');
  const [mood, setMood] = useState('Funny');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, deductCoins } = useStore();

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error("Enter a topic!");
    
    setLoading(true);
    const success = await deductCoins(GENERATION_COST);
    if (!success) {
      toast.error('Not enough coins!');
      setLoading(false);
      return;
    }

    const executeGen = async () => {
      try {
        const res = await generateCaption(topic, mood);
        setResult(res);
      } catch (e) {
        toast.error("Error generating text.");
      } finally {
        setLoading(false);
      }
    };
    
    useStore.getState().triggerGenerationAd(executeGen, executeGen);
  };

  return (
    <div className="flex flex-col h-full gap-4 relative z-10">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Video Topic / Content</label>
        <textarea 
          placeholder="e.g. Getting ready for a date..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors resize-none h-24"
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />
      </div>
      
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Vibe</label>
        <div className="flex flex-wrap gap-2">
          {['Funny', 'Aesthetic', 'Sad', 'Gaming', 'Educational'].map(m => (
            <button 
              key={m}
              onClick={() => setMood(m)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${mood === m ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <GenerateButton onClick={handleGenerate} loading={loading} />
      <ResultBox result={result} type="caption" user={user} />
    </div>
  );
}

function HashtagTool() {
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, deductCoins } = useStore();

  const handleGenerate = async () => {
    if (!category.trim()) return toast.error("Enter a category!");
    setLoading(true);
    const success = await deductCoins(GENERATION_COST);
    if (!success) {
      toast.error('Not enough coins!');
      setLoading(false);
      return;
    }

    const executeGen = async () => {
      try {
        const res = await generateHashtags(category);
        setTags(res);
      } catch(e) {
        toast.error("Error generating tags.");
      } finally {
        setLoading(false);
      }
    };
    
    useStore.getState().triggerGenerationAd(executeGen, executeGen);
  };

  return (
    <div className="flex flex-col h-full gap-4 relative z-10">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Niche / Category</label>
        <input 
          type="text"
          placeholder="e.g. Anime Edit, Valorant, Gym..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
      </div>
      
      <GenerateButton onClick={handleGenerate} loading={loading} />
      
      {tags.length > 0 && (
         <div className="mt-4 bg-gray-900/60 border border-cyan-500/20 rounded-2xl p-4">
           <div className="flex flex-wrap gap-2 mb-4">
             {tags.map((t, i) => (
                <span key={i} className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded">
                  {t}
                </span>
             ))}
           </div>
           <ResultActions text={tags.join(' ')} type="hashtag" user={user} />
         </div>
      )}
    </div>
  );
}

function BioTool() {
  const [keywords, setKeywords] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, deductCoins } = useStore();

  const handleGenerate = async () => {
    if (!keywords.trim()) return toast.error("Enter keywords!");
    setLoading(true);
    if (!(await deductCoins(GENERATION_COST))) {
      toast.error('Not enough coins!');
      setLoading(false); return;
    }
    
    const executeGen = async () => {
      try {
        setResult(await generateBio(keywords));
      } finally { setLoading(false); }
    };
    
    useStore.getState().triggerGenerationAd(executeGen, executeGen);
  }

  return (
    <div className="flex flex-col h-full gap-4 relative z-10">
      <textarea 
        placeholder="Keywords (e.g. 19, NYC, Dancer, Leo)"
        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white h-24"
        value={keywords} onChange={e => setKeywords(e.target.value)}
      />
      <GenerateButton onClick={handleGenerate} loading={loading} />
      <ResultBox result={result} type="bio" user={user} />
    </div>
  );
}

function IdeaTool() {
  const [niche, setNiche] = useState('');
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user, deductCoins } = useStore();

  const handleGenerate = async () => {
    if (!niche.trim()) return toast.error("Enter a niche!");
    setLoading(true);
    if (!(await deductCoins(GENERATION_COST))) {
      toast.error('Not enough coins!');
      setLoading(false); return;
    }
    
    const executeGen = async () => {
      try {
        setIdea(await generateVideoIdea(niche));
      } finally { setLoading(false); }
    };
    
    useStore.getState().triggerGenerationAd(executeGen, executeGen);
  }

  return (
    <div className="flex flex-col h-full gap-4 relative z-10">
      <input 
        type="text" placeholder="Niche (e.g. Street Photography)"
        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white"
        value={niche} onChange={e => setNiche(e.target.value)}
      />
      <GenerateButton onClick={handleGenerate} loading={loading} />
      
      {idea && (
        <div className="mt-4 bg-gray-900/60 border border-amber-500/20 rounded-2xl p-4 space-y-4">
          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Title</span>
            <h3 className="font-bold text-lg leading-tight">{idea.title}</h3>
          </div>
          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Hook</span>
            <p className="text-sm font-medium italic text-amber-100">"{idea.hook}"</p>
          </div>
          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Description</span>
            <p className="text-sm text-gray-300">{idea.description}</p>
          </div>
          <ResultActions text={`Idea: ${idea.title}\nHook: ${idea.hook}`} type="video_idea" user={user} />
        </div>
      )}
    </div>
  );
}

// === SHARED COMPONENTS ===

function GenerateButton({ onClick, loading }: { onClick: () => void, loading: boolean }) {
  const { appUser } = useStore();
  return (
    <button 
      onClick={onClick} disabled={loading}
      className="w-full mt-4 bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
    >
      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <>
          Generate <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-600"/> {appUser?.isPremium ? '0' : GENERATION_COST}</span>
        </>
      )}
    </button>
  );
}

function ResultBox({ result, type, user }: { result: string, type: string, user: any }) {
  if (!result) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-gray-900 border border-gray-700 p-4 rounded-2xl">
      <p className="whitespace-pre-wrap text-sm leading-relaxed mb-4">{result}</p>
      <ResultActions text={result} type={type} user={user} />
    </motion.div>
  );
}

function ResultActions({ text, type, user }: { text: string, type: string, user: any }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const favId = Date.now().toString();
      await setDoc(doc(db, 'users', user.uid, 'favorites', favId), {
        type, content: text, createdAt: new Date().toISOString()
      });
      toast.success("Saved to favorites!");
    } catch(e) {
      toast.error("Failed to save.");
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleCopy} className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors">
        <Copy className="w-4 h-4" /> Copy
      </button>
      <button onClick={handleSave} className="flex-1 bg-pink-600 hover:bg-pink-500 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
}
