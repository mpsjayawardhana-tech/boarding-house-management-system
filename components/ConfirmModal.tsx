import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  description, 
  onConfirm, 
  onCancel, 
  confirmText = "Yes, do it", 
  cancelText = "Cancel" 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181a1f] rounded-3xl p-6 md:p-8 border border-[#2a2d36] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ff5a5a]/10 flex items-center justify-center border border-[#ff5a5a]/20 shadow-sm">
            <AlertCircle className="w-6 h-6 text-[#ff5a5a]" />
          </div>
          
          <div>
            <h3 className="font-extrabold text-xl tracking-tight text-white">{title}</h3>
            <p className="text-sm text-gray-400 mt-2 font-medium">
              {description}
            </p>
          </div>
          
          <div className="flex items-center w-full gap-3 mt-4">
            <button 
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-[#23252b] hover:text-white transition-colors border border-transparent"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 bg-[#ff5a5a] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-red-500 transition-colors shadow-red-500/20"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
