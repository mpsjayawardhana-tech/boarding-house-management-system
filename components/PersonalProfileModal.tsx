"use client";

import { useAppStore } from "@/store";
import { X, Calendar, User } from "lucide-react";
import Image from "next/image";
import { CustomCloudinaryUpload } from "./CustomCloudinaryUpload";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PersonalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonalProfileModal({ isOpen, onClose }: PersonalProfileModalProps) {
  const { users, currentUserId, updateUser, updateUserAvatar } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);
  
  const [birthday, setBirthday] = useState<string>('');

  useEffect(() => {
    if (currentUser?.birthday) {
      setBirthday(currentUser.birthday);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSave = () => {
    if (birthday) {
      updateUser(currentUser.id, { birthday });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C0D0E]/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#141618] border border-white/[0.1] rounded-3xl p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl relative flex flex-col gap-8"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl text-white tracking-tight">Personal Profile</h3>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-28 h-28 relative rounded-full overflow-hidden bg-[#1A1D20] border-4 border-[#1C1E22] shadow-xl">
                  <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
                </div>
                <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full">
                   <CustomCloudinaryUpload 
                     compact={true} 
                     onUploadSuccess={(url) => updateUserAvatar(currentUser.id, url)} 
                   />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-bold text-white tracking-tight">{currentUser.name}</h4>
                <p className="text-emerald-400 text-sm font-semibold capitalize">{currentUser.role}</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Birthday
                </label>
                <input 
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="bg-[#0B0C0E] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all w-full"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-2">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </div>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
