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
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => void;
  deleteNotice: (id: string) => void;
  markNoticeDone: (id: string, isDone: boolean) => void;
}

const today = format(new Date(), 'yyyy-MM-dd');
const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');

const initialNotices: Notice[] = [
  {
    id: '1',
    scope: 'common',
    priority: 'emergency',
    title: 'Electricity Bill Overdue!',
    description: 'Please settle the electricity bill immediately to avoid disconnection.',
    createdAt: today,
    createdBy: 'admin-1', // Generic ID for seed
  },
  {
    id: '2',
    scope: 'me',
    priority: 'event',
    title: 'IEEE Committee Meeting',
    description: 'Discuss the upcoming tech symposium.',
    dueDate: nextWeek,
    createdAt: today,
    createdBy: 'me',
    isDone: false,
  },
  {
    id: '3',
    scope: 'me',
    priority: 'normal',
    title: 'Finish CMIS Assignment',
    description: 'Complete the database design schema.',
    createdAt: today,
    createdBy: 'me',
    isDone: false,
  }
];

export const useNoticeStore = create<NoticeState>()(
  persist(
    (set) => ({
      notices: initialNotices,
      addNotice: (notice) => set((state) => ({
        notices: [{
          ...notice,
          id: Date.now().toString(),
          createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        }, ...state.notices]
      })),
      deleteNotice: (id) => set((state) => ({
        notices: state.notices.filter(n => n.id !== id)
      })),
      markNoticeDone: (id, isDone) => set((state) => ({
        notices: state.notices.map(n => n.id === id ? { ...n, isDone } : n)
      }))
    }),
    {
      name: 'pcg-boarding-notices',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
