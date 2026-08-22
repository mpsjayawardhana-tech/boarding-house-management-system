"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, Sparkles, X, BookOpen, Crown, Info, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store';
import { curriculumData } from '../lib/curriculumData';

type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E' | '';

const GRADE_POINTS: Record<Exclude<Grade, ''>, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'E': 0.0
};

type ActiveSubject = {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: Grade;
  level: number;
  semester: number;
};

export function GPACalculator() {
  const currentUser = useAppStore(state => state.currentUserId);
  const enrollments = useAppStore(state => state.enrollments);
  const globalCourses = useAppStore(state => state.courses);

  const [activeSubjects, setActiveSubjects] = useState<ActiveSubject[]>([]);
  const [activeTab, setActiveTab] = useState<'syllabus' | 'custom'>('syllabus');

  // Syllabus Tab State
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedSyllabusCodes, setSelectedSyllabusCodes] = useState<string[]>([]);

  // Custom Tab State
  const [customForm, setCustomForm] = useState({
    code: '', name: '', credits: 3, grade: '' as Grade, level: 1, semester: 1
  });

  const [predictive, setPredictive] = useState({
    active: false,
    targetCredits: 15,
    targetGPA: 4.0,
    totalDegreeCredits: 120
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    import('@/lib/apiFetch').then(({ apiFetch }) => {
      apiFetch(`/api/gpa?userId=${currentUser}`)
        .then(res => res.json())
        .then(data => {
          if (data.gpaData) {
            setActiveSubjects(data.gpaData.activeSubjects || []);
            if (data.gpaData.predictive) setPredictive(data.gpaData.predictive);
          }
          setIsLoaded(true);
        })
        .catch(err => {
          console.error("Failed to fetch GPA data:", err);
          setIsLoaded(true);
        });
    });
  }, [currentUser]);

  useEffect(() => {
    if (!isLoaded || !currentUser) return;
    const timeout = setTimeout(() => {
      import('@/lib/apiFetch').then(({ apiFetch }) => {
        apiFetch('/api/gpa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser, activeSubjects, predictive })
        }).catch(console.error);
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [activeSubjects, predictive, isLoaded, currentUser]);

  // Calculate stats based on activeSubjects
  const calculatedData = useMemo(() => {
    // Group subjects by Level and Semester
    const grouped: Record<string, ActiveSubject[]> = {};
    activeSubjects.forEach(sub => {
      const key = `Level ${sub.level} - Semester ${sub.semester}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(sub);
    });

    // Sort keys (Level 1 Sem 1, Level 1 Sem 2, etc.)
    const sortedKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    let cumulativeCredits = 0;
    let cumulativePoints = 0;

    const semesterStats = sortedKeys.map(key => {
      let semCredits = 0;
      let semPoints = 0;

      grouped[key].forEach(c => {
        if (c.credits === 0) return; // Explicitly filter out zero-credit subjects (e.g. English)
        if (c.grade) {
          const points = GRADE_POINTS[c.grade as keyof typeof GRADE_POINTS] * c.credits;
          semCredits += c.credits;
          semPoints += points;
        }
      });

      const sgpa = semCredits > 0 ? semPoints / semCredits : 0;
      cumulativeCredits += semCredits;
      cumulativePoints += semPoints;
      const cgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;

      return {
        id: key,
        name: key,
        sgpa,
        cgpa,
        semCredits,
        cumulativeCredits,
        cumulativePoints,
        subjects: grouped[key]
      };
    });

    const currentCGPA = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;
    
    // Future predictions
    let projectedCGPA = currentCGPA;
    let maxPossibleCGPA = currentCGPA;
    const remainingCreditsToDegree = Math.max(0, predictive.totalDegreeCredits - cumulativeCredits);

    if (predictive.active && predictive.targetCredits > 0) {
      const newTotalCredits = cumulativeCredits + predictive.targetCredits;
      const newTotalPoints = cumulativePoints + (predictive.targetCredits * predictive.targetGPA);
      projectedCGPA = newTotalCredits > 0 ? newTotalPoints / newTotalCredits : 0;
    }

    if (remainingCreditsToDegree > 0) {
      const maxTotalCredits = cumulativeCredits + remainingCreditsToDegree;
      const maxTotalPoints = cumulativePoints + (remainingCreditsToDegree * 4.0);
      maxPossibleCGPA = maxTotalPoints / maxTotalCredits;
    }

    // Chart Data
    const chartData = semesterStats.map(s => ({
      name: s.name.replace('Level ', 'L').replace('Semester ', 'S'),
      CGPA: Number(s.cgpa.toFixed(2)),
      MaxTrajectory: null as number | null
    }));

    if (chartData.length > 0) {
      chartData[chartData.length - 1].MaxTrajectory = Number(chartData[chartData.length - 1].CGPA.toFixed(2));
      if (predictive.active) {
        chartData.push({ name: 'Target', CGPA: Number(projectedCGPA.toFixed(2)), MaxTrajectory: null });
      }
      if (remainingCreditsToDegree > 0) {
        chartData.push({ name: 'Graduation', CGPA: undefined as any, MaxTrajectory: Number(maxPossibleCGPA.toFixed(2)) });
      }
    }

    return { semesterStats, currentCGPA, totalCredits: cumulativeCredits, projectedCGPA, maxPossibleCGPA, chartData };
  }, [activeSubjects, predictive]);

  const handleAddSyllabusSubjects = () => {
    const subjectsToAdd = curriculumData
      .filter(s => s.level === selectedLevel && s.semester === selectedSemester && selectedSyllabusCodes.includes(s.code))
      .map(s => ({
        id: Date.now().toString() + Math.random(),
        code: s.code,
        name: s.name,
        credits: s.credits,
        grade: '' as Grade,
        level: s.level,
        semester: s.semester
      }));

    setActiveSubjects(prev => [...prev, ...subjectsToAdd]);
    setSelectedSyllabusCodes([]);
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name) return;
    
    setActiveSubjects(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      ...customForm
    }]);

    setCustomForm({ code: '', name: '', credits: 3, grade: '', level: 1, semester: 1 });
  };

  const updateSubjectGrade = (id: string, grade: Grade) => {
    setActiveSubjects(prev => prev.map(s => s.id === id ? { ...s, grade } : s));
  };

  const removeSubject = (id: string) => {
    setActiveSubjects(prev => prev.filter(s => s.id !== id));
  };

  const getClassification = (cgpa: number) => {
    if (cgpa >= 3.70) return { text: 'First Class Honours', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
    if (cgpa >= 3.30) return { text: 'Second Class Upper', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
    if (cgpa >= 3.00) return { text: 'Second Class Lower', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
    if (cgpa >= 2.00) return { text: 'Pass', color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
    return { text: 'Needs Improvement', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  const currentClass = getClassification(calculatedData.currentCGPA);

  // Available subjects for selected level/semester
  const availableSyllabusSubjects = useMemo(() => {
    return curriculumData.filter(s => s.level === selectedLevel && s.semester === selectedSemester);
  }, [selectedLevel, selectedSemester]);

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Header & Overall Summary */}
      <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[5rem] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Calculator className="w-6 h-6 text-emerald-400" /> GPA Calculator
            </h2>
            <p className="text-gray-400 text-sm mt-1">Plan and predict your academic journey</p>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Current CGPA</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{calculatedData.currentCGPA.toFixed(2)}</span>
            </div>
            <div className="w-px h-12 bg-white/10 mx-2 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Credits</span>
              <span className="text-lg sm:text-xl font-bold text-gray-300">{calculatedData.totalCredits}</span>
            </div>
            <div className={`px-2 sm:px-4 py-2 rounded-xl border ${currentClass.bg} ${currentClass.border} flex flex-col items-center justify-center sm:ml-2 w-full sm:w-auto mt-2 sm:mt-0`}>
              <Crown className={`w-4 h-4 sm:w-5 sm:h-5 ${currentClass.color}`} />
              <span className={`text-[9px] sm:text-[10px] font-bold mt-1 uppercase text-center ${currentClass.color}`}>{currentClass.text}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subject Entry & List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Add Subjects Panel */}
          <div className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-[32px] p-6">
            <div className="flex bg-black/40 p-1.5 rounded-2xl w-fit border border-white/5 shadow-inner mb-6">
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'syllabus' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                University Syllabus
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'custom' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                Custom Subject
              </button>
            </div>

            {activeTab === 'syllabus' ? (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Level</label>
                    <select 
                      value={selectedLevel}
                      onChange={e => setSelectedLevel(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value={1}>Level 1</option>
                      <option value={2}>Level 2</option>
                      <option value={3}>Level 3</option>
                      <option value={4}>Level 4</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Semester</label>
                    <select 
                      value={selectedSemester}
                      onChange={e => setSelectedSemester(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value={1}>Semester I</option>
                      <option value={2}>Semester II</option>
                    </select>
                  </div>
                </div>

                {availableSyllabusSubjects.length > 0 ? (
                  <div className="mt-2">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Subjects</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                      {availableSyllabusSubjects.map(sub => {
                        const isChecked = selectedSyllabusCodes.includes(sub.code);
                        // Check if already in active subjects
                        const isAlreadyAdded = activeSubjects.some(a => a.code === sub.code);
                        return (
                          <label key={sub.code} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed bg-black/20 border-white/5' : isChecked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/20 border-[#2a2d36] hover:bg-white/5'}`}>
                            <input 
                              type="checkbox"
                              disabled={isAlreadyAdded}
                              checked={isChecked || isAlreadyAdded}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedSyllabusCodes(prev => [...prev, sub.code]);
                                else setSelectedSyllabusCodes(prev => prev.filter(c => c !== sub.code));
                              }}
                              className="mt-1 w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500/20 bg-black/50"
                            />
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${isChecked ? 'text-emerald-400' : 'text-gray-300'}`}>{sub.code}</span>
                              <span className="text-[10px] text-gray-500 line-clamp-1">{sub.name}</span>
                              <span className="text-[10px] font-bold text-gray-400 mt-0.5">{sub.credits} Credits</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {selectedSyllabusCodes.length > 0 && (
                      <button 
                        onClick={handleAddSyllabusSubjects}
                        className="mt-4 w-full bg-emerald-500 text-black py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
                      >
                        Add {selectedSyllabusCodes.length} Subjects
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 font-medium">
                    No subjects found for Level {selectedLevel} Semester {selectedSemester}.
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAddCustomSubject} className="flex flex-col gap-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Subject Code/Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CMIS 1113"
                      value={customForm.name}
                      onChange={e => setCustomForm({...customForm, name: e.target.value})}
                      className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Credits</label>
                    <input 
                      type="number" 
                      min="1" max="12"
                      value={customForm.credits}
                      onChange={e => setCustomForm({...customForm, credits: Number(e.target.value)})}
                      className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Grade</label>
                    <select 
                      value={customForm.grade}
                      onChange={e => setCustomForm({...customForm, grade: e.target.value as Grade})}
                      className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value="">N/A</option>
                      {Object.keys(GRADE_POINTS).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Level</label>
                    <select 
                      value={customForm.level}
                      onChange={e => setCustomForm({...customForm, level: Number(e.target.value)})}
                      className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value={1}>Level 1</option>
                      <option value={2}>Level 2</option>
                      <option value={3}>Level 3</option>
                      <option value={4}>Level 4</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Semester</label>
                    <select 
                      value={customForm.semester}
                      onChange={e => setCustomForm({...customForm, semester: Number(e.target.value)})}
                      className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value={1}>Semester I</option>
                      <option value={2}>Semester II</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="mt-2 w-full bg-emerald-500 text-black py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
                >
                  Add Custom Subject
                </button>
              </form>
            )}
          </div>

          {/* Active Subjects List by Semester */}
          <div className="flex flex-col gap-4">
            {calculatedData.semesterStats.length === 0 ? (
              <div className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-[32px] p-10 text-center flex flex-col items-center">
                <BookOpen className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-300">No Subjects Added Yet</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-sm">Use the panel above to add subjects from the syllabus or add your own custom subjects.</p>
              </div>
            ) : (
              calculatedData.semesterStats.map(sem => (
                <div key={sem.id} className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl overflow-hidden">
                  <div className="bg-black/20 p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h3 className="font-extrabold text-lg text-white">{sem.name}</h3>
                      <div className="hidden sm:flex gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md">
                          SGPA: {sem.sgpa.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md">
                          CGPA: {sem.cgpa.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col gap-2">
                    {sem.subjects.map(sub => (
                      <div key={sub.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors group">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <span className="font-bold text-sm text-gray-200 min-w-[100px]">{sub.code || sub.name}</span>
                          <span className="text-xs text-gray-500 flex-1 truncate">{sub.code ? sub.name : ''}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 bg-black/40 px-2 py-1 rounded-md">{sub.credits} Crd</span>
                          
                          <select 
                            value={sub.grade}
                            onChange={(e) => updateSubjectGrade(sub.id, e.target.value as Grade)}
                            className="bg-[#23252b] border border-[#2a2d36] text-white text-sm font-bold rounded-lg p-1.5 focus:outline-none focus:border-emerald-500/50 w-16"
                          >
                            <option value="">--</option>
                            {Object.keys(GRADE_POINTS).map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                          
                          <button 
                            onClick={() => removeSubject(sub.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Analytics */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-[32px] p-6 relative overflow-hidden">
            <h3 className="font-extrabold text-lg text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Performance Trend
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calculatedData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d36" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 4.0]} stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickCount={5} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141618', borderColor: '#2a2d36', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="CGPA" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="MaxTrajectory" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 justify-center mt-4 text-xs font-bold text-gray-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-emerald-500"></div> Actual CGPA</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-blue-500 border-dashed border"></div> Max Possible</div>
            </div>
          </div>

          <div className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-[32px] p-6 relative overflow-hidden">
            <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Target Predictor
            </h3>
            
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-[#2a2d36] bg-black/20 cursor-pointer mb-4 hover:bg-white/5 transition-colors">
              <input 
                type="checkbox" 
                checked={predictive.active}
                onChange={e => setPredictive({...predictive, active: e.target.checked})}
                className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500/20 bg-black/50"
              />
              <span className="text-sm font-bold text-gray-300">Enable Predictor</span>
            </label>

            <AnimatePresence>
              {predictive.active && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                      Target Credits <span className="text-emerald-400">{predictive.targetCredits}</span>
                    </label>
                    <input 
                      type="range" min="1" max="40" 
                      value={predictive.targetCredits}
                      onChange={e => setPredictive({...predictive, targetCredits: parseInt(e.target.value)})}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                      Target GPA <span className="text-emerald-400">{predictive.targetGPA.toFixed(2)}</span>
                    </label>
                    <input 
                      type="range" min="2.0" max="4.0" step="0.1"
                      value={predictive.targetGPA}
                      onChange={e => setPredictive({...predictive, targetGPA: parseFloat(e.target.value)})}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  
                  <div className="mt-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest">Projected CGPA</span>
                    <span className="text-3xl font-extrabold text-emerald-400 mt-1">{calculatedData.projectedCGPA.toFixed(2)}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
