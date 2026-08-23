import { create } from 'zustand';

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E' | '';

export const GRADE_POINTS: Record<Exclude<Grade, ''>, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'E': 0.0
};

export type ActiveSubject = {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: Grade;
  level: number;
  semester: number;
};

export type PredictiveState = {
  active: boolean;
  targetCredits: number;
  targetGPA: number;
  totalDegreeCredits: number;
};

interface AcademicState {
  activeSubjects: ActiveSubject[];
  predictive: PredictiveState;
  isLoaded: boolean;
  
  setActiveSubjects: (subjects: ActiveSubject[]) => void;
  setPredictive: (predictive: PredictiveState) => void;
  
  fetchGPAData: (userId: string) => Promise<void>;
  saveGPAData: (userId: string) => Promise<void>;
}

export const useAcademicStore = create<AcademicState>((set, get) => ({
  activeSubjects: [],
  predictive: {
    active: false,
    targetCredits: 15,
    targetGPA: 4.0,
    totalDegreeCredits: 120
  },
  isLoaded: false,

  setActiveSubjects: (subjects) => set({ activeSubjects: subjects }),
  setPredictive: (predictive) => set({ predictive }),

  fetchGPAData: async (userId: string) => {
    try {
      const { apiFetch } = await import('@/lib/apiFetch');
      const res = await apiFetch(`/api/gpa?userId=${userId}`);
      const data = await res.json();
      
      if (data.gpaData) {
        set({
          activeSubjects: Array.isArray(data.gpaData.activeSubjects) ? data.gpaData.activeSubjects : [],
          predictive: data.gpaData.predictive || get().predictive,
          isLoaded: true
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (err) {
      console.error("Failed to fetch GPA data:", err);
      set({ isLoaded: true });
    }
  },

  saveGPAData: async (userId: string) => {
    try {
      const { activeSubjects, predictive } = get();
      const { apiFetch } = await import('@/lib/apiFetch');
      
      await apiFetch('/api/gpa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, activeSubjects, predictive })
      });
    } catch (err) {
      console.error("Failed to save GPA data:", err);
    }
  }
}));
