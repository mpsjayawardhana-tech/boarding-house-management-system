import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, addDays } from 'date-fns';

export type NoticeScope = 'common' | 'me';
export type NoticePriority = 'normal' | 'event' | 'emergency';

export interface Notice {
  id: string;
  scope: NoticeScope;
  priority: NoticePriority;
  title: string;
  description: string;
  dueDate?: string;
  createdAt: string;
  createdBy: string;
  isDone?: boolean;
}

interface NoticeState {
  notices: Notice[];
  fetchNotices: () => Promise<void>;
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  markNoticeDone: (id: string, isDone: boolean) => Promise<void>;
}

export const useNoticeStore = create<NoticeState>((set, get) => ({
  notices: [],
  
  fetchNotices: async () => {
    try {
      const { apiFetch } = await import('@/lib/apiFetch');
      const response = await apiFetch('/api/notices');
      const data = await response.json();
      if (data.notices) {
        set({ notices: data.notices });
      }
    } catch (error) {
      console.error("Failed to fetch notices:", error);
    }
  },
  
  addNotice: async (notice) => {
    const newNotice = {
      ...notice,
      id: Date.now().toString(),
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };
    
    // Optimistic update
    set((state) => ({ notices: [newNotice, ...state.notices] }));
    
    try {
      const { apiFetch } = await import('@/lib/apiFetch');
      await apiFetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice)
      });
    } catch (error) {
      console.error("Failed to save notice:", error);
    }
  },
  
  deleteNotice: async (id) => {
    set((state) => ({ notices: state.notices.filter(n => n.id !== id) }));
    try {
      const { apiFetch } = await import('@/lib/apiFetch');
      await apiFetch(`/api/notices?id=${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Failed to delete notice:", error);
    }
  },
  
  markNoticeDone: async (id, isDone) => {
    set((state) => ({
      notices: state.notices.map(n => n.id === id ? { ...n, isDone } : n)
    }));
    try {
      const { apiFetch } = await import('@/lib/apiFetch');
      await apiFetch('/api/notices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDone })
      });
    } catch (error) {
      console.error("Failed to update notice status:", error);
    }
  }
}));
