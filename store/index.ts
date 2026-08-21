import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, addWeeks } from 'date-fns';

export type User = {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
  role: 'admin' | 'member' | 'super_admin';
  status?: 'active' | 'suspended' | 'pending_approval';
  username?: string;
  password?: string;
  birthday?: string;
  email?: string;
  phone?: string;
  joinedAt?: string;
  roomId?: string | null;
  dashboardLayout?: string[];
};

export type Room = {
  id: string;
  name: string;
  inviteCode: string;
  university?: string;
  faculty?: string;
  logoUrl?: string;
};

export type AuditLog = {
  id: string;
  actorId: string;
  action: string;
  targetId?: string;
  timestamp: string;
  details?: string;
};

export type TaskType = string;

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
  emoji?: string;
  targetDays?: string[];
};

export type RosterConfig = {
  activeDays: string[];
  tasks: RosterTask[];
  schedulingMode?: 'deterministic' | 'manual';
  manualAssignments?: Record<string, Record<string, string[]>>; // dayName -> taskId -> [userIds]
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

export type Payment = {
  id: string;
  payerId: string;
  payeeId: string;
  amount: number;
  date: string;
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

export type CourseSession = {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  type: 'Lecture' | 'Practical' | 'Tutorial';
  room: string;
};

export const generateSessionId = (courseId: string, session: CourseSession) => {
  return `${courseId}-${session.dayOfWeek}-${session.startTime}-${session.type}-${session.room}`.replace(/\s+/g, '');
};

export type Course = {
  id: string;
  code?: string;
  name: string;
  creditHours: number;
  sessions: CourseSession[];
};

export type Holiday = {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  isLongVacation: boolean;
};

export type TimetableConfig = {
  validFrom: string;
  validTo: string;
  mandatoryBaseCourses?: string[];
};

export type Attendance = {
  id: string;
  userId: string;
  courseId: string;
  date: string;
  status: 'attended' | 'missed';
};

interface AppState {
  pastStates: string[]; // For Undo stack
  pushUndoState: () => void;
  undoLastAction: () => void;
  resetAllData: () => void;
  
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  removeUser: (id: string) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  updateUserAvatar: (userId: string, avatar: string) => void;
  updateUserDashboardLayout: (userId: string, layout: string[]) => void;
  
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  removeRoom: (id: string) => void;
  
  isAdminAuthenticated: boolean;
  authenticateAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  
  isProfileModalOpen: boolean;
  setProfileModalOpen: (isOpen: boolean) => void;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  logout: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  
  impersonatedUserId: string | null;
  setImpersonatedUserId: (id: string | null) => void;
  
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
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
  payments: Payment[];
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
  addPayment: (payerId: string, payeeId: string, amount: number) => void;

  toggleBoardingFee: (userId: string, year: number, month: number) => void;

  // Timetable & Attendance State
  courses: Course[];
  holidays: Holiday[];
  timetableConfig: TimetableConfig;
  attendances: Attendance[];
  enrollments: Record<string, string[]>;
  enrolledSessions: Record<string, string[]>;

  addCourse: (course: Omit<Course, 'id'>) => void;
  removeCourse: (id: string) => void;
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  removeHoliday: (id: string) => void;
  updateTimetableConfig: (config: Partial<TimetableConfig>) => void;
  markAttendance: (userId: string, courseId: string, date: string, status: 'attended' | 'missed') => void;
  removeAttendance: (id: string) => void;
  toggleCourseEnrollment: (userId: string, courseId: string) => void;
  setEnrollments: (userId: string, courseIds: string[]) => void;
  toggleSessionEnrollment: (userId: string, sessionId: string) => void;
}

const defaultUsers: User[] = [
  { id: '1', name: 'Manusha', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Manusha', isActive: true, role: 'admin', status: 'active', username: 'Manusha', password: 'abc123', roomId: 'room_1', birthday: '2004-12-01', email: 'manusha@example.com', phone: '0712345678', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '2', name: 'Kasun', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Kasun', isActive: true, role: 'member', status: 'active', username: 'kasun', password: 'abc123', roomId: 'room_1', birthday: '2000-01-01', email: 'kasun@example.com', phone: '0711111111', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '3', name: 'Champika', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Champika', isActive: true, role: 'member', status: 'active', username: 'champika', password: 'abc123', roomId: 'room_1', birthday: '2001-02-02', email: 'champika@example.com', phone: '0722222222', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '4', name: 'Janidu', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Janidu', isActive: true, role: 'member', status: 'active', username: 'janidu', password: 'abc123', roomId: 'room_1', birthday: '2002-03-03', email: 'janidu@example.com', phone: '0733333333', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '5', name: 'Binoj', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Binoj', isActive: true, role: 'member', status: 'active', username: 'binoj', password: 'abc123', roomId: 'room_1', birthday: '2003-04-04', email: 'binoj@example.com', phone: '0744444444', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '6', name: 'Kaveeth', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Kaveeth', isActive: true, role: 'member', status: 'active', username: 'kaveeth', password: 'abc123', roomId: 'room_1', birthday: '2005-05-05', email: 'kaveeth@example.com', phone: '0755555555', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '7', name: 'SuperAdmin', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Super', isActive: true, role: 'super_admin', status: 'active', username: 'superadmin', password: 'superpassword', roomId: null, email: 'super@admin.com', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
];

const defaultRosterConfig: RosterConfig = {
  activeDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  tasks: [
    { id: 'sweep', name: 'Sweep the floor', frequency: 'daily', assigneesPerOccurrence: 2 },
    { id: 'mop', name: 'Mop the floor', frequency: 'weekly', occurrencesPerWeek: 1, assigneesPerOccurrence: 2 },
    { id: 'toilet', name: 'Clean Toilet', frequency: 'weekly', occurrencesPerWeek: 1, assigneesPerOccurrence: 1 }
  ],
  schedulingMode: 'deterministic',
  manualAssignments: {}
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
        const { pastStates, pushUndoState, undoLastAction, resetAllData, completeTask, undoTaskCompletion, addInventoryLog, updateInventoryLog, deleteInventoryLog, addInventoryContribution, forceNextCycle, revertPreviousCycle, updateItemQuota, adminEditProgress, addP2PDebt, updateP2PDebt, deleteP2PDebt, toggleBoardingFee, addUser, removeUser, updateUser, updateUserAvatar, toggleCourseEnrollment, toggleSessionEnrollment, setCurrentUserId, updateRosterConfig, addInventoryItem, removeInventoryItem, ...stateData } = state as any;
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
          boardingFees: {},
          courses: [
            {
              id: 'c1', code: 'CMIS 2113', name: 'Object - Oriented Programming', creditHours: 3,
              sessions: [
                { dayOfWeek: 'Monday', startTime: '08:30', endTime: '10:30', type: 'Lecture', room: 'MH' },
                { dayOfWeek: 'Tuesday', startTime: '08:30', endTime: '10:30', type: 'Practical', room: 'Gp. III' },
                { dayOfWeek: 'Wednesday', startTime: '13:30', endTime: '15:30', type: 'Practical', room: 'Gp. II' },
                { dayOfWeek: 'Thursday', startTime: '13:30', endTime: '15:30', type: 'Practical', room: 'Gp. I' },
                { dayOfWeek: 'Friday', startTime: '12:30', endTime: '14:30', type: 'Practical', room: 'Gp. IV' }
              ]
            },
            {
              id: 'c2', code: 'CMIS 2123', name: 'Database Management System', creditHours: 3,
              sessions: [
                { dayOfWeek: 'Monday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'MH' },
                { dayOfWeek: 'Monday', startTime: '13:30', endTime: '15:30', type: 'Practical', room: 'Gp. I' },
                { dayOfWeek: 'Monday', startTime: '15:30', endTime: '16:30', type: 'Tutorial', room: 'LR-07' },
                { dayOfWeek: 'Wednesday', startTime: '10:30', endTime: '12:30', type: 'Practical', room: 'Gp. II' },
                { dayOfWeek: 'Thursday', startTime: '08:30', endTime: '10:30', type: 'Practical', room: 'Gp. III' },
                { dayOfWeek: 'Thursday', startTime: '15:30', endTime: '17:30', type: 'Practical', room: 'Gp. IV' }
              ]
            },
            {
              id: 'c3', code: 'MATH 2114', name: 'Linear Algebra I', creditHours: 3,
              sessions: [
                { dayOfWeek: 'Tuesday', startTime: '13:30', endTime: '15:30', type: 'Lecture', room: 'MH' },
                { dayOfWeek: 'Wednesday', startTime: '07:30', endTime: '08:30', type: 'Tutorial', room: 'MH' },
                { dayOfWeek: 'Friday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'LR-09' }
              ]
            },
            {
              id: 'c4', code: 'STAT 2112', name: 'Statistical Inference I', creditHours: 2,
              sessions: [
                { dayOfWeek: 'Tuesday', startTime: '15:30', endTime: '16:30', type: 'Tutorial', room: 'MH' },
                { dayOfWeek: 'Wednesday', startTime: '08:30', endTime: '10:30', type: 'Lecture', room: 'MH' }
              ]
            },
            {
              id: 'c5', code: 'IMGT 2112', name: 'Operations Management I', creditHours: 2,
              sessions: [
                { dayOfWeek: 'Tuesday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'LR-07' },
                { dayOfWeek: 'Thursday', startTime: '13:30', endTime: '14:30', type: 'Tutorial', room: 'Gp. I & II, LR-07' }
              ]
            },
            {
              id: 'c6', code: 'IMGT 2122', name: 'Cost & Management Accounting', creditHours: 2,
              sessions: [
                { dayOfWeek: 'Monday', startTime: '13:30', endTime: '15:30', type: 'Lecture', room: 'LR-07' },
                { dayOfWeek: 'Thursday', startTime: '14:30', endTime: '15:30', type: 'Tutorial', room: 'Gp. I & II, LR-07' }
              ]
            },
            {
              id: 'c7', code: 'IMGT 2132', name: 'Service Industry Concepts', creditHours: 2,
              sessions: [
                { dayOfWeek: 'Wednesday', startTime: '15:30', endTime: '16:30', type: 'Tutorial', room: 'Gp. I & II' },
                { dayOfWeek: 'Thursday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'LR-07' }
              ]
            },
            {
              id: 'c8', code: 'ELTN 2112', name: 'Electricity & Magnetism', creditHours: 2,
              sessions: [
                { dayOfWeek: 'Wednesday', startTime: '15:30', endTime: '16:30', type: 'Tutorial', room: '' },
                { dayOfWeek: 'Thursday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'LR-08' }
              ]
            },
            {
              id: 'c9', code: 'ELTN 2121', name: 'Electricity & Magnetism Lab', creditHours: 1,
              sessions: [
                { dayOfWeek: 'Wednesday', startTime: '10:30', endTime: '12:30', type: 'Practical', room: 'Gp. I' },
                { dayOfWeek: 'Wednesday', startTime: '13:30', endTime: '15:30', type: 'Practical', room: 'Gp. II' }
              ]
            },
            {
              id: 'c10', code: 'ELPC 2+20', name: 'English Language Proficiency Course II', creditHours: 2,
              sessions: [
                { dayOfWeek: 'Friday', startTime: '08:30', endTime: '10:30', type: 'Lecture', room: 'Mini Aud/LR 01/02/03' }
              ]
            }
          ],
          holidays: [],
          timetableConfig: { validFrom: format(new Date(), 'yyyy-MM-dd'), validTo: format(addWeeks(new Date(), 16), 'yyyy-MM-dd'), mandatoryBaseCourses: [] },
          attendances: [],
          enrollments: {},
          enrolledSessions: {},
          auditLogs: [],
          impersonatedUserId: null,
          rooms: [{ 
            id: 'room_1', 
            name: 'Bodima Original', 
            inviteCode: 'BODIMA2026',
            university: 'Wayamba University of Sri Lanka',
            faculty: 'Technology',
            logoUrl: '/bodimalogo.png' 
          }]
        };
      }),

      users: defaultUsers,
      addUser: (user) => set(state => {
        state.pushUndoState();
        return { users: [...state.users, { password: 'abc123', ...user, id: Date.now().toString(), isActive: true }] };
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
      updateUserDashboardLayout: (userId, layout) => set(state => {
        state.pushUndoState();
        return { users: state.users.map(u => u.id === userId ? { ...u, dashboardLayout: layout } : u) };
      }),
      
      isAdminAuthenticated: false,
      authenticateAdmin: (username, password) => {
        const state = get();
        const normalizedInputUser = username.trim().toLowerCase();
        
        const admin = state.users.find(u => 
          u.role === 'admin' &&
          u.username?.trim().toLowerCase() === normalizedInputUser
        );
        
        if (admin && password.trim() === (admin.password || 'abc123')) {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },
      logoutAdmin: () => set({ isAdminAuthenticated: false }),
      
      isProfileModalOpen: false,
      setProfileModalOpen: (isOpen) => set({ isProfileModalOpen: isOpen }),
      
      currentUserId: '',
      setCurrentUserId: (id) => set({ currentUserId: id }),
      logout: () => {
        set({ currentUserId: '' });
        useAppStore.persist.clearStorage();
        if (typeof window !== 'undefined') {
          window.location.replace('/');
        }
      },
      
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      impersonatedUserId: null,
      setImpersonatedUserId: (id) => set({ impersonatedUserId: id }),
      
      auditLogs: [],
      addAuditLog: (log) => set(state => ({
        auditLogs: [{ id: Date.now().toString(), timestamp: new Date().toISOString(), ...log }, ...state.auditLogs]
      })),
      
      rooms: [{ 
        id: 'room_1', 
        name: 'Bodima Original', 
        inviteCode: 'BODIMA2026',
        university: 'Wayamba University of Sri Lanka',
        faculty: 'Technology',
        logoUrl: '/bodimalogo.png'
      }],
      addRoom: (room) => set(state => {
        state.pushUndoState();
        return { rooms: [...state.rooms, { ...room, id: Date.now().toString() }] };
      }),
      updateRoom: (id, room) => set(state => {
        state.pushUndoState();
        return { rooms: state.rooms.map(r => r.id === id ? { ...r, ...room } : r) };
      }),
      removeRoom: (id) => set(state => {
        state.pushUndoState();
        return { rooms: state.rooms.filter(r => r.id !== id) };
      }),

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
        const newId = Date.now().toString();
        return { 
          inventoryItems: [...state.inventoryItems, { ...item, id: newId }],
          inventoryCycles: { ...state.inventoryCycles, [newId]: { currentCycle: 1, userProgress: {}, userDebts: {} } }
        };
      }),
      removeInventoryItem: (id) => set(state => {
        state.pushUndoState();
        return { inventoryItems: state.inventoryItems.filter(i => i.id !== id) };
      }),
      inventoryLogs: [],
      inventoryCycles: {},
      p2pDebts: [],
      payments: [],
      boardingFees: {},
      courses: [
        { id: 'cmis2113_L', code: 'CMIS 2113 (L)', name: 'Object-Oriented Programming (Lecture)', creditHours: 2, sessions: [{ dayOfWeek: 'Monday', startTime: '08:30', endTime: '10:30', type: 'Lecture', room: 'MH' }] },
        { id: 'cmis2113_P_Gp1', code: 'CMIS 2113 (P) Gp. I', name: 'OOP Practical (Group I)', creditHours: 1, sessions: [{ dayOfWeek: 'Thursday', startTime: '13:30', endTime: '15:30', type: 'Practical', room: 'LR-07' }] },
        { id: 'cmis2113_P_Gp2', code: 'CMIS 2113 (P) Gp. II', name: 'OOP Practical (Group II)', creditHours: 1, sessions: [{ dayOfWeek: 'Wednesday', startTime: '13:30', endTime: '15:30', type: 'Practical', room: 'Gp. II' }] },
        { id: 'cmis2113_P_Gp3', code: 'CMIS 2113 (P) Gp. III', name: 'OOP Practical (Group III)', creditHours: 1, sessions: [{ dayOfWeek: 'Tuesday', startTime: '08:30', endTime: '10:30', type: 'Practical', room: 'Gp. III' }] },
        { id: 'cmis2113_P_Gp4', code: 'CMIS 2113 (P) Gp. IV', name: 'OOP Practical (Group IV)', creditHours: 1, sessions: [{ dayOfWeek: 'Friday', startTime: '12:30', endTime: '14:30', type: 'Practical', room: 'Gp. IV' }] },
        
        { id: 'cmis2123_L', code: 'CMIS 2123 (L)', name: 'Database Management System (Lecture)', creditHours: 2, sessions: [{ dayOfWeek: 'Monday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'MH' }] },
        { id: 'cmis2123_T', code: 'CMIS 2123 (T)', name: 'Database Management (Tutorial)', creditHours: 0, sessions: [{ dayOfWeek: 'Monday', startTime: '15:30', endTime: '16:30', type: 'Tutorial', room: 'LR-07' }] },
        { id: 'cmis2123_P_Gp1', code: 'CMIS 2123 (P) Gp. I', name: 'DBMS Practical (Group I)', creditHours: 1, sessions: [{ dayOfWeek: 'Monday', startTime: '13:30', endTime: '15:30', type: 'Practical', room: 'Gp. I' }] },
        { id: 'cmis2123_P_Gp2', code: 'CMIS 2123 (P) Gp. II', name: 'DBMS Practical (Group II)', creditHours: 1, sessions: [{ dayOfWeek: 'Wednesday', startTime: '10:30', endTime: '12:30', type: 'Practical', room: 'Gp. II' }] },
        { id: 'cmis2123_P_Gp3', code: 'CMIS 2123 (P) Gp. III', name: 'DBMS Practical (Group III)', creditHours: 1, sessions: [{ dayOfWeek: 'Thursday', startTime: '08:30', endTime: '10:30', type: 'Practical', room: 'Gp. III' }] },
        { id: 'cmis2123_P_Gp4', code: 'CMIS 2123 (P) Gp. IV', name: 'DBMS Practical (Group IV)', creditHours: 1, sessions: [{ dayOfWeek: 'Thursday', startTime: '15:30', endTime: '17:30', type: 'Practical', room: 'Gp. IV' }] },

        { id: 'stat2112_L', code: 'STAT 2112 (L)', name: 'Statistical Inference I (Lecture)', creditHours: 2, sessions: [{ dayOfWeek: 'Wednesday', startTime: '08:30', endTime: '10:30', type: 'Lecture', room: 'MH' }] },
        { id: 'stat2112_T', code: 'STAT 2112 (T)', name: 'Statistical Inference I (Tutorial)', creditHours: 0, sessions: [{ dayOfWeek: 'Tuesday', startTime: '15:30', endTime: '16:30', type: 'Tutorial', room: 'MH' }] },

        { id: 'imgt2112_L', code: 'IMGT 2112 (L)', name: 'Operations Management I (Lecture)', creditHours: 2, sessions: [{ dayOfWeek: 'Tuesday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'LR-07' }] },
        { id: 'imgt2112_T', code: 'IMGT 2112 (T)', name: 'Operations Mgt I (Tutorial Gp I&II)', creditHours: 0, sessions: [{ dayOfWeek: 'Thursday', startTime: '13:30', endTime: '14:30', type: 'Tutorial', room: 'LR-07' }] },

        { id: 'imgt2122_L', code: 'IMGT 2122 (L)', name: 'Cost & Management Accounting (Lecture)', creditHours: 2, sessions: [{ dayOfWeek: 'Monday', startTime: '13:30', endTime: '15:30', type: 'Lecture', room: 'LR-07' }] },
        { id: 'imgt2122_T', code: 'IMGT 2122 (T)', name: 'Cost & Mgt Acc (Tutorial Gp I&II)', creditHours: 0, sessions: [{ dayOfWeek: 'Thursday', startTime: '14:30', endTime: '15:30', type: 'Tutorial', room: 'LR-07' }] },

        { id: 'imgt2132_L', code: 'IMGT 2132 (L)', name: 'Service Industry Concepts (Lecture)', creditHours: 2, sessions: [{ dayOfWeek: 'Thursday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'LR-07' }] },
        { id: 'imgt2132_T', code: 'IMGT 2132 (T)', name: 'Service Ind. Concepts (Tutorial Gp I&II)', creditHours: 0, sessions: [{ dayOfWeek: 'Wednesday', startTime: '15:30', endTime: '16:30', type: 'Tutorial', room: 'Gp. I & II' }] },

        { id: 'eltn2112_L', code: 'ELTN 2112 (L)', name: 'Electricity & Magnetism (Lecture)', creditHours: 2, sessions: [{ dayOfWeek: 'Thursday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'LR-08' }] },
        { id: 'eltn2112_T', code: 'ELTN 2112 (T)', name: 'Electricity & Magnetism (Tutorial)', creditHours: 0, sessions: [{ dayOfWeek: 'Wednesday', startTime: '15:30', endTime: '16:30', type: 'Tutorial', room: '' }] },

        { id: 'eltn2121_P_Gp1', code: 'ELTN 2121 (P) Gp. I', name: 'Elec & Mag Lab (Group I)', creditHours: 1, sessions: [{ dayOfWeek: 'Wednesday', startTime: '10:30', endTime: '12:30', type: 'Practical', room: 'Gp. I' }] },
        { id: 'eltn2121_P_Gp2', code: 'ELTN 2121 (P) Gp. II', name: 'Elec & Mag Lab (Group II)', creditHours: 1, sessions: [{ dayOfWeek: 'Wednesday', startTime: '13:30', endTime: '15:30', type: 'Practical', room: 'Gp. II' }] },

        { id: 'math2114_L', code: 'MATH 2114 (L)', name: 'Linear Algebra I (Lecture)', creditHours: 3, sessions: [{ dayOfWeek: 'Tuesday', startTime: '13:30', endTime: '15:30', type: 'Lecture', room: 'MH' }, { dayOfWeek: 'Friday', startTime: '10:30', endTime: '12:30', type: 'Lecture', room: 'LR-09' }] },
        { id: 'math2114_T', code: 'MATH 2114 (T)', name: 'Linear Algebra I (Tutorial)', creditHours: 0, sessions: [{ dayOfWeek: 'Wednesday', startTime: '07:30', endTime: '08:30', type: 'Tutorial', room: 'MH' }] },

        { id: 'elpc220_L', code: 'ELPC 2+20 (L)', name: 'English Language Proficiency Course II', creditHours: 2, sessions: [{ dayOfWeek: 'Friday', startTime: '08:30', endTime: '10:30', type: 'Lecture', room: 'Mini Aud' }] }
      ],
      holidays: [],
      timetableConfig: { validFrom: format(new Date(), 'yyyy-MM-dd'), validTo: format(addWeeks(new Date(), 16), 'yyyy-MM-dd'), mandatoryBaseCourses: [] },
      attendances: [],
      enrollments: {},
      enrolledSessions: {},

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
      addPayment: (payerId, payeeId, amount) => set(state => {
        state.pushUndoState();
        return {
          payments: [{
            id: Date.now().toString(),
            payerId,
            payeeId,
            amount,
            date: format(new Date(), 'yyyy-MM-dd')
          }, ...state.payments]
        };
      }),

      toggleBoardingFee: (userId, year, month) => set(state => {
        const yearData = state.boardingFees[year] || {};
        const monthData = yearData[month] || {};
        
        const newFees = {
          ...state.boardingFees,
          [year]: {
            ...yearData,
            [month]: {
              ...monthData,
              [userId]: !monthData[userId]
            }
          }
        };
        return {
          boardingFees: newFees
        };
      }),

      addCourse: (course) => set(state => {
        state.pushUndoState();
        return { courses: [...state.courses, { ...course, id: Date.now().toString() }] };
      }),
      removeCourse: (id) => set(state => {
        state.pushUndoState();
        return { courses: state.courses.filter(c => c.id !== id) };
      }),
      addHoliday: (holiday) => set(state => {
        state.pushUndoState();
        return { holidays: [...state.holidays, { ...holiday, id: Date.now().toString() }] };
      }),
      removeHoliday: (id) => set(state => {
        state.pushUndoState();
        return { holidays: state.holidays.filter(h => h.id !== id) };
      }),
      updateTimetableConfig: (config) => set(state => {
        state.pushUndoState();
        return { timetableConfig: { ...state.timetableConfig, ...config } };
      }),
      markAttendance: (userId, courseId, date, status) => set(state => {
        state.pushUndoState();
        // Remove existing record for this user/course/date if it exists to avoid duplicates
        const filtered = state.attendances.filter(a => !(a.userId === userId && a.courseId === courseId && a.date === date));
        return { attendances: [...filtered, { id: Date.now().toString(), userId, courseId, date, status }] };
      }),
      removeAttendance: (id) => set(state => {
        state.pushUndoState();
        return { attendances: state.attendances.filter(a => a.id !== id) };
      }),
      toggleCourseEnrollment: (userId, courseId) => set(state => {
        state.pushUndoState();
        const userEnrollments = state.enrollments[userId] || [];
        const isEnrolled = userEnrollments.includes(courseId);
        
        return {
          enrollments: {
            ...state.enrollments,
            [userId]: isEnrolled 
              ? userEnrollments.filter(id => id !== courseId)
              : [...userEnrollments, courseId]
          }
        };
      }),
      toggleSessionEnrollment: (userId, sessionId) => set(state => {
        state.pushUndoState();
        const userSessions = state.enrolledSessions[userId] || [];
        const isEnrolled = userSessions.includes(sessionId);
        return {
          enrolledSessions: {
            ...state.enrolledSessions,
            [userId]: isEnrolled 
              ? userSessions.filter(id => id !== sessionId)
              : [...userSessions, sessionId]
          }
        };
      }),
      setEnrollments: (userId, courseIds) => set(state => {
        state.pushUndoState();
        return {
          enrollments: {
            ...state.enrollments,
            [userId]: courseIds
          }
        };
      }),

    }),
    {
      name: 'ms-of-pcg-storage',
      version: 1,
      storage: createJSONStorage(() => cloudStorage),
      partialize: (state) => {
        const { isAdminAuthenticated, currentUserId, ...rest } = state;
        return rest;
      },
      merge: (persistedState: any, currentState: AppState) => {
        return {
          ...currentState,
          ...persistedState,
          isAdminAuthenticated: false,
          currentUserId: currentState.currentUserId // Prevent cloud state from overwriting local auth
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
