import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useNoticeStore } from '@/store/noticeStore';
import { useAppStore } from '@/store';

interface AddDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDeadlineModal({ isOpen, onClose }: AddDeadlineModalProps) {
  const { addNotice } = useNoticeStore();
  const currentUserId = useAppStore(state => state.currentUserId);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    addNotice({
      title: formData.title,
      description: formData.description,
      type: 'academic',
      date: formData.date || undefined,
      createdBy: currentUserId,
      isDone: false
    });

    setFormData({ title: '', description: '', date: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#141618]/90 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 md:p-8 border border-[#2a2d36] max-w-lg w-full animate-in zoom-in-95 duration-200 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#23252b] hover:bg-white/10 text-gray-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-2xl tracking-tight text-white">Add Deadline</h3>
              <p className="text-gray-400 text-sm">Pin an upcoming academic deadline.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
              <input 
                type="text" 
                placeholder="e.g. SE3010 Final Project"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-blue-500/50 focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Subject / Description</label>
              <textarea 
                rows={3}
                placeholder="Submission details..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-blue-500/50 focus:outline-none transition-colors resize-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Due Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-blue-500/50 focus:outline-none transition-colors cursor-pointer"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-[#23252b] transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:bg-blue-400 transition-colors">
              Save Deadline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
