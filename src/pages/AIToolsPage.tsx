import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, Save, Loader2, Coins, DownloadCloud, Lock, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store';
import { generateCaption, generateHashtags, generateBio, generateVideoIdea, generateScript } from '../lib/gemini';
import { db } from '../lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export default function AIToolsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useStore();

  const isRoot = location.pathname === '/tools' || location.pathname === '/tools/';

  const text = {
    title: language === 'my' ? 'AI တူးလ်များ' : 'AI Generation Tools',
    caption: language === 'my' ? 'စာတမ်း ဖန်တီးရန်' : 'Caption Generator',
    hashtag: language === 'my' ? 'Hashtag ဖန်တီးရန်' : 'Hashtag Generator',
    bio: language === 'my' ? 'Bio ဖန်တီးရန်' : 'Bio Generator',
    idea: language === 'my' ? 'အကြံဉာဏ် ဖန်တီးရန်' : 'Video Ideas',
    script: language === 'my' ? 'ဇာတ်ညွှန်း ရေးရန်' : 'Script Writer',
    downloader: language === 'my' ? 'ဗီဒီယို ဒေါင်းလုပ်' : 'Video Downloader',
    captionDesc: language === 'my' ? 'ဆွဲဆောင်မှုရှိသော စာသားများ' : 'Write viral hooks',
    hashtagDesc: language === 'my' ? 'ရေပန်းစား Hashtags ရှာရန်' : 'Find trending tags',
    bioDesc: language === 'my' ? 'ပရိုဖိုင် အသစ်ဖန်တီးရန်' : 'Aesthetic profile bios',
    ideaDesc: language === 'my' ? 'အမြဲတမ်း အသစ်အသစ်' : 'Never run out of content',
    scriptDesc: language === 'my' ? 'စက္ကန့် ၆၀ ဇာတ်ညွှန်း' : '60-second video flow',
    dlDesc: language === 'my' ? 'Watermark မပါ (PRO)' : 'No watermark (PRO)'
  };

  if (isRoot) {
    // If they click AI tools directly, just show the list
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 pt-12 relative z-10 pb-24">
        <h1 className="text-2xl font-bold mb-6 font-display">{text.title}</h1>
        <div className="flex flex-col gap-4">
          <ToolCard title={text.caption} path="caption" desc={text.captionDesc} color="from-pink-500 to-rose-500" />
          <ToolCard title={text.hashtag} path="hashtag" desc={text.hashtagDesc} color="from-cyan-400 to-blue-500" />
          <ToolCard title={text.bio} path="bio" desc={text.bioDesc} color="from-purple-500 to-indigo-500" />
          <ToolCard title={text.idea} path="idea" desc={text.ideaDesc} color="from-amber-400 to-orange-500" />
          <ToolCard title={text.script} path="script" desc={text.scriptDesc} color="from-teal-400 to-emerald-500" />
          <ToolCard title={text.downloader} path="downloader" desc={text.dlDesc} color="from-green-500 to-emerald-600" />
        </div>
      </motion.div>
    );
  }

  const toolName = location.pathname.split('/').pop();

  return (
    <div className="h-full relative flex flex-col pt-8 pb-24">
      {/* Universal header for tools */}
      <div className="flex items-center px-4 py-4 border-b border-white/5 z-20 bg-black/80 backdrop-blur-md sticky top-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/5">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-2 font-bold text-lg capitalize font-display">{toolName} Generator</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
        <Routes>
          <Route path="caption" element={<CaptionTool />} />
          <Route path="hashtag" element={<HashtagTool />} />
          <Route path="bio" element={<BioTool />} />
          <Route path="idea" element={<IdeaTool />} />
          <Route path="script" element={<ScriptTool />} />
          <Route path="downloader" element={<DownloaderTool />} />
        </Routes>
      </div>
    </div>
  );
}

function ToolCard({ title, path, desc, color }: { title: string, path: string, desc: string, color: string }) {
  const nav = useNavigate();
  return (
    <motion.div 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={() => nav(path)} 
      className="bg-black/40 border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] shadow-lg group cursor-pointer overflow-hidden relative"
    >
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl pointer-events-none group-hover:opacity-20 transition-opacity`} />
      <div className={`w-3 h-12 rounded-full bg-gradient-to-b ${color}`} />
      <div className="relative z-10">
        <h3 className="font-bold text-white mb-0.5">{title}</h3>
        <p className="text-[11px] text-gray-400">{desc}</p>
      </div>
    </motion.div>
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
          <ResultActions text={`Idea: ${idea.title}\nHook: ${idea.hook}\nDesc: ${idea.description}`} type="video_idea" user={user} />
        </div>
      )}
    </div>
  );
}

function ScriptTool() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, deductCoins } = useStore();

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error("Enter a topic!");
    setLoading(true);
    if (!(await deductCoins(GENERATION_COST))) {
      toast.error('Not enough coins!');
      setLoading(false); return;
    }
    
    const executeGen = async () => {
      try {
        setResult(await generateScript(topic));
      } finally { setLoading(false); }
    };
    
    useStore.getState().triggerGenerationAd(executeGen, executeGen);
  }

  return (
    <div className="flex flex-col h-full gap-4 relative z-10">
      <textarea 
        placeholder="What should the 60s script be about?"
        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white h-24"
        value={topic} onChange={e => setTopic(e.target.value)}
      />
      <GenerateButton onClick={handleGenerate} loading={loading} />
      <ResultBox result={result} type="script" user={user} />
    </div>
  );
}

// === SHARED COMPONENTS ===

function GenerateButton({ onClick, loading }: { onClick: () => void, loading: boolean }) {
  const { appUser, language } = useStore();
  const generateText = language === 'my' ? 'ဖန်တီးမည်' : 'Generate';
  return (
    <button 
      onClick={onClick} disabled={loading}
      className="w-full mt-4 bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
    >
      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <>
          {generateText} <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-600"/> {appUser?.isPremium ? '0' : GENERATION_COST}</span>
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
  const { language } = useStore();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success(language === 'my' ? "ကူးယူပီးပါပြီ" : "Copied to clipboard!");
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const favId = Date.now().toString();
      await setDoc(doc(db, 'users', user.uid, 'favorites', favId), {
        type, content: text, createdAt: new Date().toISOString()
      });
      toast.success(language === 'my' ? "သိမ်းဆည်းပေးပါပြီ" : "Saved to favorites!");
    } catch(e) {
      toast.error(language === 'my' ? "မအောင်မြင်ပါ" : "Failed to save.");
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button onClick={handleCopy} className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors">
        <Copy className="w-4 h-4" /> {language === 'my' ? 'ကူးယူရန်' : 'Copy'}
      </button>
      <button onClick={handleSave} className="flex-1 bg-pink-600 hover:bg-pink-500 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors">
        <Save className="w-4 h-4" /> {language === 'my' ? 'သိမ်းရန်' : 'Save'}
      </button>
    </div>
  );
}

function DownloaderTool() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const { appUser, language } = useStore();

  const handleDownload = async () => {
    if (!appUser?.isPremium) {
      toast.error('This feature is only for Premium users!');
      return;
    }
    
    if (!url.trim() || !url.includes('tiktok')) {
       return toast.error('Please enter a valid TikTok URL');
    }

    setLoading(true);
    setVideoData(null);
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (data.code === 0 && data.data) {
        setVideoData(data.data);
        toast.success("Video fetched successfully!");
      } else {
        toast.error(data.msg || "Failed to fetch video");
      }
    } catch(e) {
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!appUser?.isPremium) {
     return (
       <div className="flex flex-col items-center justify-center h-64 text-center">
         <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
           <Lock className="w-8 h-8 text-white" />
         </div>
         <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
         <p className="text-sm text-gray-400 mb-6 max-w-xs">Upgrade to Premium to download TikTok videos without a watermark.</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col h-full gap-4 relative z-10">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">TikTok Video URL</label>
        <input 
          type="text" placeholder="https://www.tiktok.com/@user/video/123..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-green-500/50"
          value={url} onChange={e => setUrl(e.target.value)}
        />
      </div>
      
      <button 
        onClick={handleDownload} disabled={loading}
        className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
      >
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
          <>
            <DownloadCloud className="w-5 h-5" /> {language === 'my' ? 'ရယူမည်' : 'Fetch Video'}
          </>
        )}
      </button>

      {videoData && (
        <div className="mt-4 bg-gray-900 border border-green-500/20 rounded-2xl p-4 flex flex-col items-center">
          {videoData.cover && (
             <img src={videoData.cover.startsWith('http') ? videoData.cover : "https://tikwm.com" + videoData.cover} alt="Cover" loading="lazy" className="w-full max-w-[200px] rounded-lg mb-4 shadow-lg object-cover" />
          )}
          <h3 className="text-sm font-medium text-gray-300 text-center mb-4 line-clamp-2">{videoData.title}</h3>
          
          <div className="flex gap-2 w-full">
            <a 
              href={videoData.play.startsWith('http') ? videoData.play : "https://tikwm.com" + videoData.play}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-white text-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-transform"
            >
              <DownloadCloud className="w-4 h-4" /> {language === 'my' ? 'ဒေါင်းလုပ်ဆွဲရန်' : 'Download Video'}
            </a>
          </div>
          <p className="text-[10px] text-gray-500 text-center mt-4">
             Note: Due to device security, clicking download might open the video in a new tab. You can long-press to save it to your device.
          </p>
        </div>
      )}
    </div>
  );
}
