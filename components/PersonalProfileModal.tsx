"use client";

import { useAppStore } from "@/store";
import { X, Calendar, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { CustomCloudinaryUpload } from "./CustomCloudinaryUpload";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PersonalProfileModal() {
  const { users, currentUserId, updateUser, updateUserAvatar, isProfileModalOpen, setProfileModalOpen } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);
  
  const [birthday, setBirthday] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      setBirthday(currentUser.birthday || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser, isProfileModalOpen]);

  if (!currentUser) return null;

  const handleSave = () => {
    updateUser(currentUser.id, { 
      birthday: birthday || undefined,
      email: email || undefined,
      phone: phone || undefined
    });
    setProfileModalOpen(false);
  };

  const onClose = () => setProfileModalOpen(false);

  return (
    <AnimatePresence>
      {isProfileModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C0D0E]/80 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#141618] border border-white/[0.1] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl text-white tracking-tight">Edit Profile</h3>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0">
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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input 
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0B0C0E] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all w-full placeholder:text-gray-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                <input 
                  type="tel"
                  value={phone}
                  placeholder="e.g. 0712345678"
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-[#0B0C0E] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all w-full placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
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
