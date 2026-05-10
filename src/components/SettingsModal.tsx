import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Bell, Trash2, Shield, Info, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { toast } from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, setLanguage } = useStore();
  const [notifications, setNotifications] = useState(true);

  if (!isOpen) return null;

  const handleClearCache = () => {
    localStorage.clear();
    setLanguage(language); // Restore language setting
    toast.success(language === 'my' ? "မှတ်ဉာဏ်များ ရှင်းလင်းပြီးပါပြီ" : "Cache cleared successfully");
  };

  const text = {
    title: language === 'my' ? 'ဆက်တင်များ' : 'Settings',
    language: language === 'my' ? 'ဘာသာစကား' : 'Language',
    notifications: language === 'my' ? 'အသိပေးချက်များ' : 'Notifications',
    clearCache: language === 'my' ? 'မှတ်ဉာဏ်ရှင်းလင်းရန်' : 'Clear Cache',
    privacy: language === 'my' ? 'ကိုယ်ရေးကိုယ်တာ မူဝါဒ' : 'Privacy Policy',
    about: language === 'my' ? 'အက်ပ်အကြောင်း' : 'About App',
    deleteAcc: language === 'my' ? 'အကောင့်ဖျက်ရန်' : 'Delete Account',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6 pb-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="relative w-full max-w-md bg-gray-900 border-t sm:border border-gray-800 sm:rounded-2xl rounded-t-3xl p-6 shadow-2xl h-[85vh] sm:h-auto overflow-y-auto no-scrollbar"
        >
          <div className="w-12 h-1 bg-gray-700 mx-auto rounded-full mb-6 sm:hidden" />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">{text.title}</h2>
            <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Preferences */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Preferences</h3>
              <div className="bg-black/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span className="font-medium">{text.language}</span>
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'my')}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="my">မြန်မာ</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">{text.notifications}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Data & Privacy */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Data & Privacy</h3>
              <div className="bg-black/50 border border-white/5 rounded-2xl overflow-hidden">
                <MenuRow icon={Trash2} iconColor="text-amber-400" label={text.clearCache} onClick={handleClearCache} />
                <div className="h-px bg-white/5 mx-4" />
                <MenuRow icon={Shield} iconColor="text-green-400" label={text.privacy} onClick={() => toast("Privacy Policy viewing")} />
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Support</h3>
              <div className="bg-black/50 border border-white/5 rounded-2xl overflow-hidden">
                <MenuRow icon={Info} iconColor="text-blue-400" label={text.about} onClick={() => toast("Version 1.0.0")} />
              </div>
            </div>
            
            <button 
              onClick={() => toast.error(language === 'my' ? "ယခုချိန်တွင် ဖျက်၍မရပါ" : "Cannot delete account right now")}
              className="w-full text-center text-rose-500 font-bold py-3 pt-6 text-sm"
            >
              {text.deleteAcc}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function MenuRow({ icon: Icon, iconColor, label, onClick }: { icon: any, iconColor: string, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-600" />
    </button>
  );
}
