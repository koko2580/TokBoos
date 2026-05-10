import { useEffect, useState, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster, toast } from 'react-hot-toast';
import { Home, Sparkles, TrendingUp, Bookmark, User, Zap } from 'lucide-react';
import { auth } from './lib/firebase/config';
import { useStore } from './store';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { showBannerAd, hideBannerAd } from './lib/admob';

import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import AIToolsPage from './pages/AIToolsPage';
import TrendsPage from './pages/TrendsPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import AdOverlay from './components/AdOverlay';

function AppContent() {
  const { user, appUser, fetchAppUser, isLoading, setUser } = useStore();
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchAppUser(u.uid);
      }
    });
    
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (appUser && !appUser.isPremium && !showSplash) {
      showBannerAd();
    } else {
      hideBannerAd();
    }
    
    return () => {
      hideBannerAd();
    };
  }, [appUser?.isPremium, showSplash]);

  if (showSplash) {
    return <SplashPage />;
  }

  const hideNav = location.pathname === '/login';

  return (
    <div className="relative flex flex-col h-full bg-black text-white w-full overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar relative">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4"></div>
        
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/tools/*" element={<RequireAuth><AIToolsPage /></RequireAuth>} />
            <Route path="/trends" element={<RequireAuth><TrendsPage /></RequireAuth>} />
            <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          </Routes>
        </AnimatePresence>
      </main>

      {!hideNav && user && <BottomNav />}
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useStore();

  const tabs = [
    { path: '/', icon: Home, label: language === 'my' ? 'ပင်မ' : 'Home' },
    { path: '/tools', icon: Sparkles, label: language === 'my' ? 'AI တူးလ်များ' : 'AI Tools' },
    { path: '/trends', icon: TrendingUp, label: language === 'my' ? 'ရေပန်းစားမှုများ' : 'Trends' },
    { path: '/favorites', icon: Bookmark, label: language === 'my' ? 'သိမ်းထားသည်များ' : 'Saved' },
    { path: '/profile', icon: User, label: language === 'my' ? 'ပရိုဖိုင်' : 'Profile' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 w-full h-16 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-around z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="relative flex flex-col items-center justify-center w-full h-full gap-1 p-2"
          >
            {isActive && (
              <motion.div 
                layoutId="nav-glow"
                className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent border-b-2 border-pink-500"
              />
            )}
            <Icon className={clsx("w-6 h-6 transition-colors relative z-10", isActive ? "text-pink-500 drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]" : "text-gray-500")} />
            <span className={clsx("text-[10px] font-medium relative z-10 transition-colors", isActive ? "text-pink-500" : "text-gray-500")}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Container to restrict width on desktop, acting like mobile screen */}
      <div className="min-h-screen bg-gray-900 flex items-center justify-center font-sans tracking-tight">
        <div className="w-full h-[100dvh] sm:h-[844px] sm:w-[390px] sm:rounded-[3rem] sm:border-[8px] sm:border-gray-800 bg-black overflow-hidden relative shadow-2xl shadow-cyan-500/20">
          <AdOverlay />
          <AppContent />
          <Toaster 
            position="top-center" 
            toastOptions={{
               style: {
                 background: '#1a1a1a',
                 color: '#fff',
                 border: '1px solid rgba(0, 240, 255, 0.3)',
                 boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
               }
            }} 
          />
        </div>
      </div>
    </BrowserRouter>
  );
}
