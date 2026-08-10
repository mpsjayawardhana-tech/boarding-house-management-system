"use client";

import { useAppStore } from "@/store";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export function ImpersonationBanner() {
  const { impersonatedUserId, setImpersonatedUserId, setCurrentUserId, users, currentUserId } = useAppStore();
  const router = useRouter();

  if (!impersonatedUserId) return null;

  const currentUser = users.find(u => u.id === currentUserId);

  const endSession = () => {
    setCurrentUserId(impersonatedUserId); // Restore original admin
    setImpersonatedUserId(null); // Clear impersonation flag
    router.push('/admin'); // Go back to admin dashboard
  };

  return (
    <div className="w-full bg-amber-500 text-black px-4 py-2 flex items-center justify-between text-xs font-bold relative z-[9999]">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} />
        <span>IMPERSONATION MODE: Viewing as {currentUser?.name}. Actions are read-only and logged.</span>
      </div>
      <button 
        onClick={endSession}
        className="px-3 py-1 bg-black text-white rounded-md hover:bg-black/80 transition-colors"
      >
        End Session
      </button>
    </div>
  );
}
