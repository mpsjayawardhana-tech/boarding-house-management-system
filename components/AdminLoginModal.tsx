import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAppStore } from "@/store";
import { useRouter } from "next/navigation";

export function AdminLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { authenticateAdmin } = useAppStore();
  const router = useRouter();
  
  const [loginUsername, setLoginUsername] = useState('Manusha');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateAdmin(loginUsername, loginPassword)) {
      setLoginError('');
      onClose();
      router.push('/settings');
    } else {
      setLoginError('Access Denied: Invalid credentials');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#141618]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl p-8 rounded-3xl w-full max-w-sm flex flex-col gap-6 relative overflow-hidden z-10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-white">Admin Login</h2>
              <p className="text-sm text-gray-400">Enter your credentials to manage settings.</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username</label>
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  className="bg-[#23252b] border border-[#2a2d36] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="bg-[#23252b] border border-[#2a2d36] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  required
                />
              </div>
              
              {loginError && <p className="text-red-400 text-xs font-medium">{loginError}</p>}

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  Unlock
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
