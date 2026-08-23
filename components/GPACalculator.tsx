"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calculator, Crown, Sparkles, TrendingUp, X, ChevronDown, ChevronUp, Settings2, Info, GraduationCap, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store';
import { curriculumData } from '../lib/curriculumData';
import { TargetGPAPredictor } from './TargetGPAPredictor';

import { useAcademicStore, Grade, GRADE_POINTS, ActiveSubject } from '../store/academicStore';

export function GPACalculator() {
  const currentUser = useAppStore(state => state.currentUserId);
  const enrollments = useAppStore(state => state.enrollments);
  const globalCourses = useAppStore(state => state.courses);

  const { activeSubjects, predictive, isLoaded, setActiveSubjects, setPredictive, fetchGPAData, saveGPAData } = useAcademicStore();
  const safeSubjects = Array.isArray(activeSubjects) ? activeSubjects : [];

  const [activeTab, setActiveTab] = useState<'syllabus' | 'custom'>('syllabus');

  // Syllabus Tab State
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedSyllabusCodes, setSelectedSyllabusCodes] = useState<string[]>([]);

  // Custom Tab State
  const [customForm, setCustomForm] = useState({
    code: '', name: '', credits: 3, grade: '' as Grade, level: 1, semester: 1
  });

  useEffect(() => {
    if (currentUser) {
      fetchGPAData(currentUser);
    }
  }, [currentUser, fetchGPAData]);

  useEffect(() => {
    if (!isLoaded || !currentUser) return;
    const timeout = setTimeout(() => {
      saveGPAData(currentUser);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [safeSubjects, predictive, isLoaded, currentUser, saveGPAData]);

  // Calculate stats based on activeSubjects
  const calculatedData = useMemo(() => {
    // Group subjects by Level and Semester
    const grouped: Record<string, ActiveSubject[]> = {};
    safeSubjects.forEach(sub => {
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

    const areaStats: Record<string, { credits: number; points: number }> = {};
    safeSubjects.forEach(c => {
      if (c.credits === 0 || !c.grade) return;
      const matchTarget = c.code || c.name;
      const prefixMatch = matchTarget.match(/^[a-zA-Z]+/);
      if (!prefixMatch) return;
      const prefix = prefixMatch[0].toUpperCase();

      if (!areaStats[prefix]) {
        areaStats[prefix] = { credits: 0, points: 0 };
      }
      const points = GRADE_POINTS[c.grade as keyof typeof GRADE_POINTS] * c.credits;
      areaStats[prefix].credits += c.credits;
      areaStats[prefix].points += points;
    });

    const areaBreakdown = Object.keys(areaStats)
      .map(prefix => ({
        prefix,
        credits: areaStats[prefix].credits,
        gpa: areaStats[prefix].credits > 0 ? areaStats[prefix].points / areaStats[prefix].credits : 0
      }))
      .filter(a => a.credits > 0)
      .sort((a, b) => b.gpa - a.gpa);

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

    return { semesterStats, currentCGPA, totalCredits: cumulativeCredits, projectedCGPA, maxPossibleCGPA, chartData, areaBreakdown };
  }, [safeSubjects, predictive]);

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

    setActiveSubjects([...safeSubjects, ...subjectsToAdd]);
    setSelectedSyllabusCodes([]);
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name) return;
    
    setActiveSubjects([...safeSubjects, {
      id: Date.now().toString() + Math.random(),
      ...customForm
    }]);

    setCustomForm({ code: '', name: '', credits: 3, grade: '', level: 1, semester: 1 });
  };

  const updateSubjectGrade = (id: string, grade: Grade) => {
    setActiveSubjects(safeSubjects.map(s => s.id === id ? { ...s, grade } : s));
  };

  const removeSubject = (id: string) => {
    setActiveSubjects(safeSubjects.filter(s => s.id !== id));
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
    <div className="w-full flex flex-col gap-8 font-sans mt-4">
      
      {/* SECTION 1: HERO STATS (Top Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Current CGPA Big Card */}
        <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] rounded-[32px] p-8 relative overflow-hidden flex flex-col justify-center h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
            <h2 className="text-xl font-extrabold tracking-widest text-gray-400 uppercase flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" /> Current CGPA
            </h2>
            <div className="flex items-end gap-4">
              <span className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {calculatedData.currentCGPA.toFixed(2)}
              </span>
              <div className="flex flex-col pb-2">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Credits</span>
                <span className="text-2xl font-bold text-gray-300">{calculatedData.totalCredits}</span>
              </div>
            </div>
            
            <div className={`mt-2 px-6 py-2 rounded-full border ${currentClass.bg} ${currentClass.border} flex items-center gap-2 w-fit`}>
              <Crown className={`w-4 h-4 ${currentClass.color}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${currentClass.color}`}>{currentClass.text}</span>
            </div>
          </div>
        </div>

        {/* Target GPA Predictor Card */}
        <TargetGPAPredictor />
      </div>

      {/* SECTION 2: VISUAL ANALYTICS (Middle Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject Area Performance */}
        <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8 relative h-fit flex flex-col">
          <h3 className="font-extrabold text-lg text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Subject Area Performance
          </h3>
          {calculatedData.areaBreakdown.length > 0 ? (
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {calculatedData.areaBreakdown.map(area => (
                <div key={area.prefix} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">{area.prefix}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{area.credits} Credits</span>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-400">{area.gpa.toFixed(2)} GPA</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#23252b] rounded-full overflow-hidden mt-1">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(area.gpa / 4.0) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${area.gpa >= 3.7 ? 'bg-emerald-500' : area.gpa >= 3.0 ? 'bg-blue-400' : 'bg-yellow-400'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-10">
              <p className="text-gray-500 text-sm">Add subjects to see your area breakdown.</p>
            </div>
          )}
        </div>

        {/* GPA Trend Chart */}
        <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8 relative h-fit flex flex-col">
          <h3 className="font-extrabold text-lg text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" /> Performance Trend
          </h3>
          <div className="h-[250px] w-full">
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

      </div>

      {/* SECTION 3: SUBJECT MANAGEMENT & ENTRY (Bottom Row) */}
      <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8 relative h-fit flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" /> Subject Management
          </h3>
          <div className="flex bg-black/40 p-1.5 rounded-2xl w-fit border border-white/5 shadow-inner">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'syllabus' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              From Syllabus
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'custom' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Custom Subject
            </button>
          </div>
        </div>

        {/* Clean Glassmorphic Add Subject Area */}
        <div className="bg-[#141618]/50 border border-white/[0.05] rounded-3xl p-6">
          {activeTab === 'syllabus' ? (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-2">
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
                <div className="flex flex-col gap-1.5 md:col-span-2">
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
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Subjects to Add</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {availableSyllabusSubjects.map(sub => {
                      const isChecked = selectedSyllabusCodes.includes(sub.code);
                      const isAlreadyAdded = safeSubjects.some(a => a.code === sub.code);
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
                      className="mt-4 px-8 bg-emerald-500 text-black py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors w-fit"
                    >
                      Add {selectedSyllabusCodes.length} Selected Subjects
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  <label className="text-xs font-bold text-gray-500 uppercase">Level</label>
                  <select 
                    value={customForm.level}
                    onChange={e => setCustomForm({...customForm, level: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none"
                  >
                    <option value={1}>Lvl 1</option>
                    <option value={2}>Lvl 2</option>
                    <option value={3}>Lvl 3</option>
                    <option value={4}>Lvl 4</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Semester</label>
                  <select 
                    value={customForm.semester}
                    onChange={e => setCustomForm({...customForm, semester: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none"
                  >
                    <option value={1}>Sem I</option>
                    <option value={2}>Sem II</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit"
                className="mt-2 w-fit px-8 bg-emerald-500 text-black py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
              >
                Add Custom Subject
              </button>
            </form>
          )}
        </div>

        {/* Active Subjects List by Semester (Accordion Style) */}
        <div className="flex flex-col gap-4 mt-4">
          <h4 className="font-extrabold text-sm text-gray-400 uppercase tracking-widest border-b border-[#2a2d36] pb-2 mb-2">My Enrolled Subjects</h4>
          
          {calculatedData.semesterStats.length === 0 ? (
            <div className="bg-black/20 border border-dashed border-white/[0.08] rounded-[32px] p-10 text-center flex flex-col items-center">
              <BookOpen className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-400">No Subjects Added Yet</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-sm">Use the panel above to add subjects to your record.</p>
            </div>
          ) : (
            calculatedData.semesterStats.map(sem => (
              <details key={sem.id} className="group bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden [&_summary::-webkit-details-marker]:hidden" open>
                <summary className="bg-black/20 p-5 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <h3 className="font-extrabold text-lg text-white">{sem.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md">
                        SGPA: {sem.sgpa.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md hidden sm:block">
                        CGPA: {sem.cgpa.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-90" />
                </summary>
                
                <div className="p-2 sm:p-4 flex flex-col gap-1">
                  {sem.subjects.map(sub => (
                    <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors group/item border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center font-black text-xs text-emerald-400 shrink-0">
                          {sub.credits}C
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-200">{sub.code || sub.name}</span>
                          {sub.code && <span className="text-[11px] text-gray-500">{sub.name}</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pl-12 sm:pl-0">
                        <select 
                          value={sub.grade}
                          onChange={(e) => updateSubjectGrade(sub.id, e.target.value as Grade)}
                          className="bg-[#23252b] border border-[#2a2d36] text-white text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50 w-20 shadow-inner"
                        >
                          <option value="">--</option>
                          {Object.keys(GRADE_POINTS).map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>

                        {sub.grade && sub.credits > 0 ? (
                          <div className="flex flex-col items-end min-w-[50px]">
                            <span className="text-sm font-extrabold text-emerald-400">
                              {(GRADE_POINTS[sub.grade as keyof typeof GRADE_POINTS] * sub.credits).toFixed(1)}
                            </span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Points</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end min-w-[50px]">
                            <span className="text-sm font-bold text-gray-600">-</span>
                            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Points</span>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => removeSubject(sub.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors sm:opacity-0 sm:group-hover/item:opacity-100"
                          title="Remove Subject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))
          )}
        </div>

      </div>
    </div>
  );

}
