"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calculator, TrendingUp, Sparkles, ChevronDown, ChevronUp, X, Crown, Settings2, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppStore } from '../store';
import { curriculumData } from '../lib/curriculumData';

type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E' | '';

const GRADE_POINTS: Record<Exclude<Grade, ''>, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'E': 0.0
};

type CourseEntry = {
  id: string;
  name: string;
  credits: number;
  grade: Grade;
};

type SemesterEntry = {
  id: string;
  name: string;
  year: string;
  courses: CourseEntry[];
};

export function GPACalculator() {
  const currentUser = useAppStore(state => state.currentUserId);
  const enrollments = useAppStore(state => state.enrollments);
  const globalCourses = useAppStore(state => state.courses);

  const [semesters, setSemesters] = useState<SemesterEntry[]>([
    {
      id: Date.now().toString(),
      name: 'Semester 1',
      year: '1st Year',
      courses: [
        { id: Date.now().toString() + '-c1', name: '', credits: 3, grade: '' }
      ]
    }
  ]);

  const [expandedSemesters, setExpandedSemesters] = useState<string[]>([semesters[0].id]);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState('Semester 1');
  
  const [predictive, setPredictive] = useState({
    active: false,
    targetCredits: 15,
    targetGPA: 4.0,
    totalDegreeCredits: 120
  });

  const toggleSemester = (id: string) => {
    setExpandedSemesters(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleAddCurriculumSemester = () => {
    const userEnrollmentIds = enrollments[currentUser] || [];
    const enrolledCourseCodes = userEnrollmentIds
        .map(id => globalCourses.find(c => c.id === id)?.code || '')
        .filter(c => c !== '');
        
    const filteredCurriculum = curriculumData.filter(c => c.year === selectedYear && c.semester === selectedSemester);
    
    let coursesToAdd = [];
    
    if (filteredCurriculum.length > 0) {
      coursesToAdd = filteredCurriculum.map((c, i) => {
        const isEnrolled = enrolledCourseCodes.some(code => code.startsWith(c.code));
        return {
           id: Date.now().toString() + `-curr${i}`,
           name: c.code + ' - ' + c.name + (isEnrolled ? ' (Enrolled)' : ''),
           credits: c.credits,
           grade: '' as Grade,
        };
      });
    } else {
      coursesToAdd = [{ id: Date.now().toString() + '-c1', name: '', credits: 3, grade: '' as Grade }];
    }
    
    const yearStr = selectedYear === 1 ? '1st Year' : selectedYear === 2 ? '2nd Year' : selectedYear === 3 ? '3rd Year' : '4th Year';
    
    const newSem = {
        id: Date.now().toString(),
        name: selectedSemester,
        year: yearStr,
        courses: coursesToAdd
    };
    
    setSemesters([...semesters, newSem]);
    setExpandedSemesters([...expandedSemesters, newSem.id]);
    setIsCurriculumOpen(false);
  };

  const removeSemester = (id: string) => {
    setSemesters(semesters.filter(s => s.id !== id));
  };

  const addCourse = (semId: string) => {
    setSemesters(sems => sems.map(s => {
      if (s.id === semId) {
        return { ...s, courses: [...s.courses, { id: Date.now().toString(), name: '', credits: 3, grade: '' }] };
      }
      return s;
    }));
  };

  const removeCourse = (semId: string, courseId: string) => {
    setSemesters(sems => sems.map(s => {
      if (s.id === semId) {
        return { ...s, courses: s.courses.filter(c => c.id !== courseId) };
      }
      return s;
    }));
  };

  const updateCourse = (semId: string, courseId: string, field: keyof CourseEntry, value: any) => {
    setSemesters(sems => sems.map(s => {
      if (s.id === semId) {
        return {
          ...s, courses: s.courses.map(c => {
            if (c.id === courseId) return { ...c, [field]: value };
            return c;
          })
        };
      }
      return s;
    }));
  };

  // Calculations
  const calculatedData = useMemo(() => {
    let cumulativeCredits = 0;
    let cumulativePoints = 0;
    
    const semesterStats = semesters.map(sem => {
      let semCredits = 0;
      let semPoints = 0;
      
      sem.courses.forEach(c => {
        if (c.grade && c.credits > 0) {
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
        id: sem.id,
        name: sem.name,
        year: sem.year,
        sgpa,
        cgpa,
        semCredits,
        cumulativeCredits,
        cumulativePoints
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

    // Chart Data Construction
    const chartData = semesterStats.map((s, idx) => ({
      name: `${s.year} ${s.name}`,
      CGPA: Number(s.cgpa.toFixed(2)),
      MaxTrajectory: null as number | null
    }));

    if (chartData.length > 0) {
      chartData[chartData.length - 1].MaxTrajectory = Number(chartData[chartData.length - 1].CGPA.toFixed(2));
      
      if (predictive.active) {
        chartData.push({
          name: 'Target (Future)',
          CGPA: Number(projectedCGPA.toFixed(2)),
          MaxTrajectory: null
        });
      }
      
      if (remainingCreditsToDegree > 0) {
        chartData.push({
          name: 'Graduation',
          CGPA: null as any,
          MaxTrajectory: Number(maxPossibleCGPA.toFixed(2))
        });
      }
    }

    return {
      semesterStats,
      currentCGPA,
      totalCredits: cumulativeCredits,
      projectedCGPA,
      maxPossibleCGPA,
      chartData
    };
  }, [semesters, predictive]);

  const getClassification = (cgpa: number) => {
    if (cgpa >= 3.70) return { text: 'First Class Honours', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
    if (cgpa >= 3.30) return { text: 'Second Class Upper', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
    if (cgpa >= 3.00) return { text: 'Second Class Lower', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
    if (cgpa >= 2.00) return { text: 'Pass', color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
    return { text: 'Needs Improvement', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  const currentClass = getClassification(calculatedData.currentCGPA);
  const projectedClass = getClassification(calculatedData.projectedCGPA);

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Header & Overall Summary */}
      <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[5rem] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Calculator className="w-7 h-7 text-emerald-400" />
              Predictive GPA Engine
            </h2>
            <p className="text-gray-400 mt-1">Track your progress and forecast your final degree classification.</p>
          </div>

          <div className="flex items-center gap-6 bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Current CGPA</span>
              <span className="text-4xl font-black text-white">{calculatedData.currentCGPA.toFixed(2)}</span>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Total Credits</span>
              <span className="text-2xl font-bold text-emerald-400">{calculatedData.totalCredits}</span>
            </div>
          </div>
        </div>

        {calculatedData.totalCredits > 0 && (
          <div className="mt-6 flex items-center gap-3 relative z-10">
            <span className="text-sm font-bold text-gray-400">Current Standing:</span>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${currentClass.bg} ${currentClass.color} ${currentClass.border} flex items-center gap-2`}>
              <Crown className="w-3.5 h-3.5" />
              {currentClass.text}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data Entry */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="flex items-center justify-between px-2">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-gray-400" />
              Academic History
            </h3>
            <button 
              onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Semester
            </button>
          </div>

          <AnimatePresence>
            {isCurriculumOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#0B0C0E] border border-emerald-500/20 rounded-2xl p-5 flex flex-col gap-4 shadow-lg mb-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <BookOpen className="w-4 h-4" /> Load from Curriculum
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select 
                      value={selectedYear}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-3 text-sm font-bold text-gray-300 focus:outline-none focus:border-emerald-500 flex-1 appearance-none cursor-pointer"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                    <select 
                      value={selectedSemester}
                      onChange={e => setSelectedSemester(e.target.value)}
                      className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-3 text-sm font-bold text-gray-300 focus:outline-none focus:border-emerald-500 flex-1 appearance-none cursor-pointer"
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleAddCurriculumSemester}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 text-black hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Load Subjects to Calculator
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-4">
            {semesters.map((sem, sIdx) => {
              const semStats = calculatedData.semesterStats.find(s => s.id === sem.id);
              const isExpanded = expandedSemesters.includes(sem.id);

              return (
                <div key={sem.id} className="bg-[#0B0C0E] border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-300 shadow-lg">
                  {/* Semester Header */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => toggleSemester(sem.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <select 
                          value={sem.year}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSemesters(sems => sems.map(s => s.id === sem.id ? { ...s, year: e.target.value } : s));
                          }}
                          onClick={e => e.stopPropagation()}
                          className="bg-black/40 text-emerald-400 font-bold text-xs focus:outline-none border border-[#2a2d36] rounded-lg px-2 py-1.5 appearance-none cursor-pointer"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                        <input 
                          type="text" 
                          value={sem.name}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSemesters(sems => sems.map(s => s.id === sem.id ? { ...s, name: e.target.value } : s));
                          }}
                          onClick={e => e.stopPropagation()}
                          className="bg-transparent text-white font-bold text-lg focus:outline-none focus:border-b border-emerald-500/50 w-24 md:w-32 placeholder-gray-600"
                          placeholder="Semester"
                        />
                      </div>
                      {semStats && semStats.semCredits > 0 && (
                        <div className="flex gap-3 text-xs font-bold hidden sm:flex">
                          <span className="text-gray-500 bg-black/40 px-2 py-1 rounded-md border border-white/5">{semStats.semCredits} Credits</span>
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">SGPA: {semStats.sgpa.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeSemester(sem.id); }}
                        className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors rounded-md hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-gray-500">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Courses List */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-white/[0.05] bg-black/20">
                      <div className="flex flex-col gap-2 mt-4">
                        <div className="grid grid-cols-12 gap-2 px-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                          <div className="col-span-6 md:col-span-7">Subject</div>
                          <div className="col-span-3 md:col-span-2 text-center">Credits</div>
                          <div className="col-span-3 md:col-span-2 text-center">Grade</div>
                          <div className="hidden md:block col-span-1"></div>
                        </div>

                        {sem.courses.map((course) => (
                          <div key={course.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6 md:col-span-7">
                              <input 
                                type="text"
                                placeholder="Course Code / Name"
                                value={course.name}
                                onChange={e => updateCourse(sem.id, course.id, 'name', e.target.value)}
                                className={`w-full bg-[#141618] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-700 ${course.name.includes('(Enrolled)') ? 'border-emerald-500/30' : 'border-[#2a2d36]'}`}
                              />
                            </div>
                            <div className="col-span-3 md:col-span-2">
                              <input 
                                type="number"
                                min="0" step="0.5"
                                value={course.credits}
                                onChange={e => updateCourse(sem.id, course.id, 'credits', parseFloat(e.target.value) || 0)}
                                className="w-full bg-[#141618] border border-[#2a2d36] rounded-lg px-3 py-2 text-sm font-mono text-center text-white focus:outline-none focus:border-emerald-500 transition-colors"
                              />
                            </div>
                            <div className="col-span-3 md:col-span-2">
                              <select
                                value={course.grade}
                                onChange={e => updateCourse(sem.id, course.id, 'grade', e.target.value)}
                                className="w-full bg-[#141618] border border-[#2a2d36] rounded-lg px-2 py-2 text-sm font-bold text-center text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                              >
                                <option value="" className="text-gray-500">-</option>
                                {Object.keys(GRADE_POINTS).map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </div>
                            <div className="hidden md:flex col-span-1 justify-center">
                              <button 
                                onClick={() => removeCourse(sem.id, course.id)}
                                className="p-1.5 text-gray-600 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => addCourse(sem.id)}
                        className="mt-4 w-full py-2 border border-dashed border-[#2a2d36] rounded-lg text-xs font-bold text-gray-500 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Custom Subject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Predictive & Chart */}
        <div className="flex flex-col gap-6">
          
          {/* Predictive Engine */}
          <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-purple-500/5 rounded-full blur-[3rem] pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-[#2a2d36] pb-3 mb-4 relative z-10">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                What-If Scenario
              </h3>
              <button 
                onClick={() => setPredictive(prev => ({ ...prev, active: !prev.active }))}
                className={`w-10 h-5 rounded-full relative transition-colors ${predictive.active ? 'bg-indigo-500' : 'bg-gray-700'}`}
              >
                <motion.div 
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm"
                  animate={{ left: predictive.active ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className={`transition-opacity duration-300 relative z-10 ${predictive.active ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Future Target Credits</label>
                  <input 
                    type="number"
                    min="0"
                    value={predictive.targetCredits}
                    onChange={e => setPredictive(p => ({ ...p, targetCredits: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/40 border border-[#2a2d36] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target GPA For Those Credits</label>
                  <input 
                    type="number"
                    min="0" max="4.0" step="0.1"
                    value={predictive.targetGPA}
                    onChange={e => setPredictive(p => ({ ...p, targetGPA: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-black/40 border border-[#2a2d36] rounded-xl px-4 py-2 text-sm text-indigo-400 font-bold focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                
                <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 mb-1 tracking-wider">Projected New CGPA</span>
                  <span className="text-3xl font-black text-white">{calculatedData.projectedCGPA.toFixed(2)}</span>
                  <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded border ${projectedClass.color} ${projectedClass.bg} ${projectedClass.border}`}>
                    {projectedClass.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trajectory Graph */}
          <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 relative overflow-hidden flex flex-col flex-1 min-h-[300px]">
            <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Trajectory
            </h3>
            
            <div className="w-full h-full flex-1 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calculatedData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d36" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickMargin={10} tickFormatter={(val) => val.split(' ').slice(-2).join(' ')} />
                  <YAxis domain={[0, 4.0]} stroke="#6b7280" fontSize={10} tickCount={5} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141618', borderColor: '#2a2d36', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    name="Actual/Target CGPA"
                    dataKey="CGPA" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#0B0C0E', stroke: '#10b981', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, fill: '#10b981' }} 
                  />
                  <Line 
                    type="monotone" 
                    name="Max Possible"
                    dataKey="MaxTrajectory" 
                    stroke="#a78bfa" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={{ fill: '#0B0C0E', stroke: '#a78bfa', strokeWidth: 2, r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
