"use client";

import { useAppStore } from "@/store";
import { X, Shield, ShieldOff, CheckCircle2, User } from "lucide-react";
import Image from "next/image";
import { CustomCloudinaryUpload } from "./CustomCloudinaryUpload";

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

export function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const { users, updateUser, updateUserAvatar } = useAppStore();
  const user = users.find(u => u.id === userId);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C0D0E]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141618] border border-white/[0.1] rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg text-white/90 tracking-tight">Boarder Profile</h3>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white/90 hover:bg-white/[0.05] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1A1D20] border border-white/[0.1] shadow-inner">
              <Image src={user.avatar} alt={user.name} fill className="object-cover" />
            </div>
            {/* The Custom Upload triggers when clicking the avatar area */}
            <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <CustomCloudinaryUpload 
                 compact={true} 
                 onUploadSuccess={(url) => updateUserAvatar(user.id, url)} 
               />
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <h4 className="text-xl font-medium text-white/90 tracking-tight">{user.name}</h4>
            <p className="text-white/40 text-sm font-normal tracking-wide flex items-center gap-1.5">
              <User className="w-4 h-4" /> ID: {user.id.slice(0, 8)}
            </p>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border w-fit ${user.isActive ? 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-[#00ff9d]' : 'bg-white/40'}`} />
              {user.isActive ? 'Active Member' : 'Deactivated'}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3 mt-2">
          {/* Admin Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${user.role === 'admin' ? 'bg-[#00ff9d]/10 text-[#00ff9d]' : 'bg-white/5 text-white/40'}`}>
                {user.role === 'admin' ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-white/90 font-medium text-sm">Administrator Access</span>
                <span className="text-white/40 text-xs">Can modify global settings</span>
              </div>
            </div>
            <button 
              onClick={() => updateUser(user.id, { role: user.role === 'admin' ? 'member' : 'admin' })}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${user.role === 'admin' ? 'bg-[#00ff9d]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute ${user.role === 'admin' ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${user.isActive ? 'bg-[#00ff9d]/10 text-[#00ff9d]' : 'bg-white/5 text-white/40'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white/90 font-medium text-sm">Account Active</span>
                <span className="text-white/40 text-xs">Include in duty roster</span>
              </div>
            </div>
            <button 
              onClick={() => updateUser(user.id, { isActive: !user.isActive })}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${user.isActive ? 'bg-[#00ff9d]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute ${user.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
