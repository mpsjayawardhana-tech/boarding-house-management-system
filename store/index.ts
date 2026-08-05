import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format } from 'date-fns';

export type User = {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
};

export type TaskType = 'sweep' | 'mop' | 'toilet';

export type Task = {
  id: string;
  type: TaskType;
  title: string;
  assigneeIds: string[];
  isCompleted: boolean;
  actualAssigneeIds?: string[];
  completedAt?: string;
};

export type DaySchedule = {
  dayName: string;
  tasks: Task[];
};

export type RosterTask = {
  id: TaskType;
  name: string;
  frequency: 'daily' | 'weekly';
  occurrencesPerWeek?: number;
  assigneesPerOccurrence: number;
};

export type RosterConfig = {
  activeDays: string[];
  tasks: RosterTask[];
};

export type InventoryItem = {
  id: string;
  name: string;
  icon: string;
  color: string;
  quota: number;
  unit: string;
};

export type InventoryLog = {
  id: string;
  itemId: string;
  date: string;
  amountStr: string;
  userId: string;
};

export type P2PDebt = {
  id: string;
  date: string;
  payerId: string;
  borrowerId: string;
  amount: number;
  description: string;
};

export type UpcomingSwap = {
  taskType: TaskType;
  fromUserId: string;
  toUserId: string;
};

export type BoardingFeeState = Record<number, Record<number, Record<string, boolean>>>;

export type InventoryCycleState = {
  currentCycle: number;
  userProgress: Record<string, number>; 
  userDebts: Record<string, number>; 
};

interface AppState {
  pastStates: string[]; // For Undo stack
  pushUndoState: () => void;
  undoLastAction: () => void;
  resetAllData: () => void;
  
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  removeUser: (id: string) => void;
  updateUserAvatar: (userId: string, avatar: string) => void;
  
  currentUserRole: 'admin' | 'user';
  toggleUserRole: () => void;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  
  // Roster State
  rosterConfig: RosterConfig;
  updateRosterConfig: (config: Partial<RosterConfig>) => void;
  completedTasksHistory: Task[];
  upcomingSwaps: UpcomingSwap[];
  dutyBalances: Record<string, number>; 
  completeTask: (task: Task, actualUserIds: string[]) => void;
  undoTaskCompletion: (task: Task) => void;

  // Inventory & Finance State
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  removeInventoryItem: (id: string) => void;
  inventoryLogs: InventoryLog[];
  inventoryCycles: Record<string, InventoryCycleState>;
  p2pDebts: P2PDebt[];
  boardingFees: BoardingFeeState; 
  
  addInventoryLog: (log: Omit<InventoryLog, 'id'>) => void;
  updateInventoryLog: (id: string, log: Omit<InventoryLog, 'id'>) => void;
  deleteInventoryLog: (id: string) => void;
  
  addInventoryContribution: (itemId: string, userId: string, amount: number) => void;
  forceNextCycle: (itemId: string) => void;
  revertPreviousCycle: (itemId: string) => void;
  updateItemQuota: (itemId: string, newQuota: number) => void;
  adminEditProgress: (itemId: string, userId: string, progress: number, debt: number) => void;
  
  addP2PDebt: (debt: Omit<P2PDebt, 'id'>) => void;
  updateP2PDebt: (id: string, debt: Omit<P2PDebt, 'id'>) => void;
  deleteP2PDebt: (id: string) => void;

  toggleBoardingFee: (userId: string, year: number, month: number) => void;
}

const defaultUsers: User[] = [
  { id: '1', name: 'Binoj', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Binoj', isActive: true },
  { id: '2', name: 'Kasun', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Kasun', isActive: true },
  { id: '3', name: 'Champika', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Champika', isActive: true },
  { id: '4', name: 'Janidu', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Janidu', isActive: true },
  { id: '5', name: 'Kaveeth', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Kaveeth', isActive: true },
  { id: '6', name: 'Manusha', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Manusha', isActive: true },
];

const defaultRosterConfig: RosterConfig = {
  activeDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  tasks: [
    { id: 'sweep', name: 'Sweep the floor', frequency: 'daily', assigneesPerOccurrence: 2 },
    { id: 'mop', name: 'Mop the floor', frequency: 'weekly', occurrencesPerWeek: 1, assigneesPerOccurrence: 2 },
    { id: 'toilet', name: 'Clean Toilet', frequency: 'weekly', occurrencesPerWeek: 1, assigneesPerOccurrence: 1 }
  ]
};

let syncTimeout: any = null;

const cloudStorage: any = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null; // Prevent SSR fetch
    console.log("Fetching state from MongoDB Atlas...");
    try {
      const response = await fetch('/api/sync');
      const data = await response.json();
      return data.state ? JSON.stringify(data.state) : null;
    } catch (e) {
      console.error("Failed to fetch state from MongoDB", e);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
      console.log("Syncing state to MongoDB Atlas...");
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: JSON.parse(value) })
        });
      } catch (e) {
        console.error("Failed to sync state to MongoDB", e);
      }
    }, 1000);
  },
  removeItem: async (name: string): Promise<void> => {
    console.log('Storage removed');
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      pastStates: [],
      pushUndoState: () => set(state => {
        const { pastStates, pushUndoState, undoLastAction, resetAllData, completeTask, undoTaskCompletion, addInventoryLog, updateInventoryLog, deleteInventoryLog, addInventoryContribution, forceNextCycle, revertPreviousCycle, updateItemQuota, adminEditProgress, addP2PDebt, updateP2PDebt, deleteP2PDebt, toggleBoardingFee, addUser, removeUser, updateUser, updateUserAvatar, toggleUserRole, setCurrentUserId, updateRosterConfig, addInventoryItem, removeInventoryItem, ...stateData } = state as any;
        const snapshot = JSON.stringify(stateData);
        return { pastStates: [...state.pastStates.slice(-9), snapshot] }; // keep last 10
      }),
      undoLastAction: () => set(state => {
        if (state.pastStates.length === 0) return state;
        const newPast = [...state.pastStates];
        const snapshotStr = newPast.pop();
        if (!snapshotStr) return state;
        const snapshot = JSON.parse(snapshotStr);
        return { ...snapshot, pastStates: newPast };
      }),
      resetAllData: () => set(state => {
        state.pushUndoState();
        return {
          users: defaultUsers,
          rosterConfig: defaultRosterConfig,
          completedTasksHistory: [],
          upcomingSwaps: [],
          dutyBalances: {},
          inventoryItems: [
            { id: 'sugar', name: 'Sugar', icon: '📦', color: 'bg-orange-100 text-orange-600 border-orange-200', quota: 1000, unit: 'g' },
            { id: 'soap', name: 'Soap Powder', icon: '🧼', color: 'bg-blue-100 text-blue-600 border-blue-200', quota: 1000, unit: 'g' },
          ],
          inventoryLogs: [],
          inventoryCycles: {
            'sugar': { currentCycle: 1, userProgress: {}, userDebts: {} },
            'soap': { currentCycle: 1, userProgress: {}, userDebts: {} }
          },
          p2pDebts: [],
          boardingFees: {}
        };
      }),

      users: defaultUsers,
      addUser: (user) => set(state => {
        state.pushUndoState();
        return { users: [...state.users, { ...user, id: Date.now().toString(), isActive: true }] };
      }),
      updateUser: (id, user) => set(state => {
        state.pushUndoState();
        return { users: state.users.map(u => u.id === id ? { ...u, ...user } : u) };
      }),
      removeUser: (id) => set(state => {
        state.pushUndoState();
        return { users: state.users.filter(u => u.id !== id) };
      }),
      updateUserAvatar: (userId, avatar) => set(state => ({
        users: state.users.map(u => u.id === userId ? { ...u, avatar } : u)
      })),
      
      currentUserRole: 'user',
      toggleUserRole: () => set(state => ({
        currentUserRole: state.currentUserRole === 'admin' ? 'user' : 'admin'
      })),
      
      currentUserId: '1',
      setCurrentUserId: (id) => set({ currentUserId: id }),

      rosterConfig: defaultRosterConfig,
      updateRosterConfig: (config) => set(state => {
        state.pushUndoState();
        return { rosterConfig: { ...state.rosterConfig, ...config } };
      }),

      completedTasksHistory: [],
      upcomingSwaps: [],
      dutyBalances: {
        '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0
      },
      
      inventoryItems: [
        { id: 'sugar', name: 'Sugar', icon: '📦', color: 'bg-orange-100 text-orange-600 border-orange-200', quota: 1000, unit: 'g' },
        { id: 'soap', name: 'Soap Powder', icon: '🧼', color: 'bg-blue-100 text-blue-600 border-blue-200', quota: 1000, unit: 'g' },
      ],
      addInventoryItem: (item) => set(state => {
        state.pushUndoState();
        return { 
          inventoryItems: [...state.inventoryItems, { ...item, id: Date.now().toString() }],
          inventoryCycles: { ...state.inventoryCycles, [item.name]: { currentCycle: 1, userProgress: {}, userDebts: {} } }
        };
      }),
      removeInventoryItem: (id) => set(state => {
        state.pushUndoState();
        return { inventoryItems: state.inventoryItems.filter(i => i.id !== id) };
      }),
      inventoryLogs: [],
      inventoryCycles: {
        'sugar': { currentCycle: 1, userProgress: {}, userDebts: {} },
        'soap': { currentCycle: 1, userProgress: {}, userDebts: {} }
      },
      p2pDebts: [],
      boardingFees: {},

      completeTask: (task, actualUserIds) => {
        set((state) => {
          if (state.completedTasksHistory.some(t => t.id === task.id)) return state;

          const scheduledUserIds = task.assigneeIds;
          const balances = { ...state.dutyBalances };
          const newSwaps = [...state.upcomingSwaps];
          
          const missedUsers = scheduledUserIds.filter(id => !actualUserIds.includes(id));
          const extraUsers = actualUserIds.filter(id => !scheduledUserIds.includes(id));

          for (let i = 0; i < Math.min(missedUsers.length, extraUsers.length); i++) {
            newSwaps.push({
              taskType: task.type,
              fromUserId: extraUsers[i],
              toUserId: missedUsers[i]
            });
          }

          missedUsers.forEach(id => balances[id] = (balances[id] || 0) + 1);
          extraUsers.forEach(id => balances[id] = (balances[id] || 0) - 1);

          const completedTask = {
            ...task,
            actualAssigneeIds: actualUserIds,
            isCompleted: true,
            completedAt: format(new Date(), 'yyyy-MM-dd')
          };
          
          return { 
            dutyBalances: balances,
            upcomingSwaps: newSwaps,
            completedTasksHistory: [...state.completedTasksHistory, completedTask]
          };
        });
      },

      undoTaskCompletion: (task) => {
        set((state) => {
          const historyTask = state.completedTasksHistory.find(t => t.id === task.id);
          if (!historyTask) return state;

          const scheduledUserIds = historyTask.assigneeIds;
          const actualUserIds = historyTask.actualAssigneeIds || [];
          const balances = { ...state.dutyBalances };
          const newSwaps = [...state.upcomingSwaps];
          
          const missedUsers = scheduledUserIds.filter(id => !actualUserIds.includes(id));
          const extraUsers = actualUserIds.filter(id => !scheduledUserIds.includes(id));

          for (let i = 0; i < Math.min(missedUsers.length, extraUsers.length); i++) {
            const swapIdx = newSwaps.findIndex(s => s.taskType === historyTask.type && s.fromUserId === extraUsers[i] && s.toUserId === missedUsers[i]);
            if (swapIdx !== -1) newSwaps.splice(swapIdx, 1);
          }

          missedUsers.forEach(id => balances[id] = (balances[id] || 0) - 1);
          extraUsers.forEach(id => balances[id] = (balances[id] || 0) + 1);
          
          return { 
            dutyBalances: balances,
            upcomingSwaps: newSwaps,
            completedTasksHistory: state.completedTasksHistory.filter(t => t.id !== task.id)
          };
        });
      },

      addInventoryLog: (log) => set(state => ({
        inventoryLogs: [{ id: Date.now().toString(), ...log }, ...state.inventoryLogs]
      })),
      updateInventoryLog: (id, log) => set(state => {
        state.pushUndoState();
        return { inventoryLogs: state.inventoryLogs.map(l => l.id === id ? { ...l, ...log } : l) };
      }),
      deleteInventoryLog: (id) => set(state => {
        state.pushUndoState();
        return { inventoryLogs: state.inventoryLogs.filter(l => l.id !== id) };
      }),

      addInventoryContribution: (itemId, userId, amount) => set(state => {
        const item = state.inventoryItems.find(i => i.id === itemId);
        if (!item) return state;
        const cycles = { ...state.inventoryCycles };
        if (!cycles[itemId]) cycles[itemId] = { currentCycle: 1, userProgress: {}, userDebts: {} };
        
        const cycle = { ...cycles[itemId] };
        cycle.userProgress = { ...cycle.userProgress };
        cycle.userProgress[userId] = (cycle.userProgress[userId] || 0) + amount;
        cycles[itemId] = cycle;
        
        return { inventoryCycles: cycles };
      }),

      forceNextCycle: (itemId) => set(state => {
        state.pushUndoState();
        const item = state.inventoryItems.find(i => i.id === itemId);
        if (!item) return state;
        const quota = item.quota;
        
        const cycles = { ...state.inventoryCycles };
        const oldCycle = cycles[itemId] || { currentCycle: 1, userProgress: {}, userDebts: {} };
        
        const newProgress: Record<string, number> = {};
        const newDebts: Record<string, number> = {};
        
        state.users.forEach(u => {
          const uId = u.id;
          const currentP = oldCycle.userProgress[uId] || 0;
          const currentD = oldCycle.userDebts[uId] || 0;
          const required = quota + currentD;
          
          if (currentP >= required) {
            newProgress[uId] = currentP - required;
            newDebts[uId] = 0;
          } else {
            newDebts[uId] = required - currentP;
            newProgress[uId] = 0;
          }
        });
        
        cycles[itemId] = {
          currentCycle: oldCycle.currentCycle + 1,
          userProgress: newProgress,
          userDebts: newDebts
        };
        
        return { inventoryCycles: cycles };
      }),

      revertPreviousCycle: (itemId) => set(state => {
        state.pushUndoState();
        const cycles = { ...state.inventoryCycles };
        const oldCycle = cycles[itemId];
        if (!oldCycle || oldCycle.currentCycle <= 1) return state;
        
        cycles[itemId] = {
          ...oldCycle,
          currentCycle: oldCycle.currentCycle - 1
        };
        
        return { inventoryCycles: cycles };
      }),

      updateItemQuota: (itemId, newQuota) => set(state => {
        state.pushUndoState();
        return {
          inventoryItems: state.inventoryItems.map(item => 
            item.id === itemId ? { ...item, quota: newQuota } : item
          )
        };
      }),

      adminEditProgress: (itemId, userId, progress, debt) => set(state => {
        state.pushUndoState();
        const cycles = { ...state.inventoryCycles };
        if (!cycles[itemId]) cycles[itemId] = { currentCycle: 1, userProgress: {}, userDebts: {} };
        
        cycles[itemId] = {
          ...cycles[itemId],
          userProgress: { ...cycles[itemId].userProgress, [userId]: progress },
          userDebts: { ...cycles[itemId].userDebts, [userId]: debt }
        };
        return { inventoryCycles: cycles };
      }),

      addP2PDebt: (debt) => set(state => ({
        p2pDebts: [{ id: Date.now().toString(), ...debt }, ...state.p2pDebts]
      })),
      updateP2PDebt: (id, debt) => set(state => {
        state.pushUndoState();
        return { p2pDebts: state.p2pDebts.map(d => d.id === id ? { ...d, ...debt } : d) };
      }),
      deleteP2PDebt: (id) => set(state => {
        state.pushUndoState();
        return { p2pDebts: state.p2pDebts.filter(d => d.id !== id) };
      }),

      toggleBoardingFee: (userId, year, month) => set(state => {
        const yearData = state.boardingFees[year] || {};
        const monthData = yearData[month] || {};
        
        return { 
          boardingFees: {
            ...state.boardingFees,
            [year]: {
              ...yearData,
              [month]: {
                ...monthData,
                [userId]: !monthData[userId]
              }
            }
          }
        };
      })

    }),
    {
      name: 'ms-of-pcg-storage',
      storage: createJSONStorage(() => cloudStorage),
    }
  )
);
