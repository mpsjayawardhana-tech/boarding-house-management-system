"use client";

import { useAppStore } from "@/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function UserProfilePage() {
  const { users, currentUserId, setCurrentUserId, setProfileModalOpen } = useAppStore();
  const router = useRouter();
  const currentUser = users.find(u => u.id === currentUserId);

  if (!currentUser) return null;

  const handleLogout = () => {
    setCurrentUserId('');
    router.push('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] pt-8 pb-24 px-6"
    >
      <div className="w-full max-w-sm bg-[#141618] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        
        <div className="w-28 h-28 relative rounded-full overflow-hidden border-4 border-[#1C1E22] shadow-xl mb-4">
          <Image src={currentUser.avatar || '/default-avatar.png'} alt={currentUser.name} fill className="object-cover" />
        </div>
        
        <h2 className="text-2xl font-bold text-white tracking-tight">{currentUser.name}</h2>
        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-8">{currentUser.role}</p>
        
        <div className="w-full flex flex-col gap-4 text-sm text-left bg-[#0C0D0E] rounded-2xl p-5 border border-white/5 mb-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-gray-500 font-medium">Birthday</span>
            <span className="text-white font-semibold">{currentUser.birthday || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-gray-500 font-medium">Email</span>
            <span className="text-white font-semibold">{currentUser.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Phone</span>
            <span className="text-white font-semibold">{currentUser.phone || 'N/A'}</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={() => setProfileModalOpen(true)}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition-all border border-white/10"
          >
            Edit Profile
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3.5 rounded-xl transition-all border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          >
            Log Out
          </button>
        </div>

      </div>
    </motion.div>
  );
}
