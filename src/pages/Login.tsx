import { useState } from 'react';
import { motion } from 'framer-motion';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase/config';
import { toast } from 'react-hot-toast';
import { Zap } from 'lucide-react';
import { useStore } from '../store';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { language } = useStore();

  const text = {
    title: 'TokBoost AI',
    desc: language === 'my' ? 'TikTok အတွက် သင်၏ အကူအညီ' : 'Sign in to power up your TikTok growth',
    emailPlaceholder: language === 'my' ? 'အီးမေးလ်' : 'Email',
    passwordPlaceholder: language === 'my' ? 'စကားဝှက်' : 'Password',
    login: language === 'my' ? 'အကောင့်ဝင်ရန်' : 'Log In',
    signup: language === 'my' ? 'အကောင့်ဖွင့်ရန်' : 'Sign Up',
    or: language === 'my' ? 'သို့မဟုတ်' : 'OR',
    google: language === 'my' ? 'Google ဖြင့် ဝင်မည်' : 'Sign in with Google',
    terms: language === 'my' ? 'ဆက်လက်လုပ်ဆောင်ခြင်းဖြင့် စည်းကမ်းချက်များကို သဘောတူပါသည်' : 'By continuing, you agree to our Terms & Privacy',
    enterBoth: language === 'my' ? 'အီးမေးလ်နှင့် စကားဝှက် ရိုက်ထည့်ပါ' : 'Enter email and password',
    welcomeBack: language === 'my' ? 'ပြန်လည်ကြိုဆိုပါတယ်!' : 'Welcome back!',
    invalidCred: language === 'my' ? 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်' : 'Invalid email or password',
    accCreated: language === 'my' ? 'အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်!' : 'Account created successfully!',
    accExists: language === 'my' ? 'အကောင့်ရှိပြီးသားဖြစ်ပါသည်၊ ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ' : 'Account already exists. Please log in.',
    weakPw: language === 'my' ? 'စကားဝှက် အားနည်းလွန်းနေပါသည်' : 'Password is too weak. Please use a stronger password.',
    failCreate: language === 'my' ? 'အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ' : 'Failed to create account',
    welcome: language === 'my' ? 'TokBoost AI မှ ကြိုဆိုပါတယ်!' : 'Welcome to TokBoost AI!',
    googleFail: language === 'my' ? 'Google ဖြင့်ဝင်ရောက်ခြင်း မအောင်မြင်ပါ' : 'Google Login failed. Please try again.',
    notEnabled: language === 'my' ? 'အီးမေးလ်ဖြင့် ဝင်ရောက်ခြင်းကို ပိတ်ထားပါသည်' : "Email/Password signin is not enabled in Firebase Console."
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success(text.welcome);
    } catch (e: any) {
      toast.error(e.message || text.googleFail);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) return toast.error(text.enterBoth);
    try {
      setLoading(true);
      await loginWithEmail(email, password);
      toast.success(text.welcomeBack);
    } catch (e: any) {
      if (e.code === 'auth/operation-not-allowed') {
        toast.error(text.notEnabled);
      } else if (e.code === 'auth/invalid-credential') {
        toast.error(text.invalidCred);
      } else {
        toast.error(e.message || text.invalidCred);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password) return toast.error(text.enterBoth);
    try {
      setLoading(true);
      await registerWithEmail(email, password);
      toast.success(text.accCreated);
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        toast.error(text.accExists);
      } else if (e.code === 'auth/operation-not-allowed') {
        toast.error(text.notEnabled);
      } else if (e.code === 'auth/weak-password') {
        toast.error(text.weakPw);
      } else {
        toast.error(e.message || text.failCreate);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col items-center justify-center px-6 relative z-10"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-cyan-500 p-1 mb-4">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" fill="currentColor" />
          </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-2 text-center mt-2">{text.title}</h1>
      <p className="text-gray-400 text-center mb-6 text-sm leading-relaxed max-w-xs">
        {text.desc}
      </p>

      <div className="w-full max-w-xs flex flex-col gap-3 mb-6">
        <input 
          type="email" 
          placeholder={text.emailPlaceholder} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input 
          type="password" 
          placeholder={text.passwordPlaceholder} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <div className="flex gap-2 mt-2">
          <button 
            onClick={handleEmailLogin}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-pink-600 to-cyan-600 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 disabled:opacity-50"
          >
            {text.login}
          </button>
          <button 
            onClick={handleEmailRegister}
            disabled={loading}
            className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-transform active:scale-95 disabled:opacity-50"
          >
            {text.signup}
          </button>
        </div>
      </div>

      <div className="w-full max-w-xs flex items-center gap-3 mb-6">
        <div className="h-px bg-white/10 flex-1"></div>
        <span className="text-xs text-gray-500 font-medium">{text.or}</span>
        <div className="h-px bg-white/10 flex-1"></div>
      </div>

      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full max-w-xs bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {text.google}
      </button>

      <p className="text-gray-500 text-xs mt-8 pb-4">{text.terms}</p>
    </motion.div>
  );
}
