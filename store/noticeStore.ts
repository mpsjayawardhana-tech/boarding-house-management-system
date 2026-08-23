import { create } from 'zustand';
import { format } from 'date-fns';

export type NoticeType = 'academic' | 'hostel' | 'emergency' | 'personal';

export interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  description: string;
  date?: string;
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
      
      if (data.notices && data.notices.length > 0) {
        set({ notices: data.notices });
      } else if (data.notices && data.notices.length === 0) {
        // Add Dummy Data
        const dummyNotices: Notice[] = [
          {
            id: 'dummy1',
            type: 'academic',
            title: 'SE3010 Final Project Submission',
            description: 'Submit your final software engineering project via the LMS portal.',
            date: format(new Date(), 'yyyy-MM-dd'),
            createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            createdBy: 'admin'
          },
          {
            id: 'dummy2',
            type: 'academic',
            title: 'Mathematics Assignment 3',
            description: 'Complete the differential equations assignment.',
            date: format(new Date(Date.now() + 86400000 * 2), 'yyyy-MM-dd'),
            createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            createdBy: 'admin'
          },
          {
            id: 'dummy3',
            type: 'hostel',
            title: 'Room Cleaning Day',
            description: 'Please ensure your room is clean. Room inspection will happen tomorrow.',
            date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
            createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            createdBy: 'admin'
          }
        ];
        set({ notices: dummyNotices });
        // Optionally POST them to db to persist
        for (const notice of dummyNotices) {
          await apiFetch('/api/notices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notice)
          });
        }
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
