"use client";

import { GraduationCap, TrendingUp, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store";
import { useAcademicStore, GRADE_POINTS } from "@/store/academicStore";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export function DashboardAcademicWidget() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const users = useAppStore(state => state.users);
  const attendances = useAppStore(state => state.attendances);
  const currentUser = users.find(u => u.id === currentUserId);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const numSlides = 3;

  const { activeSubjects, predictive, isLoaded, fetchGPAData } = useAcademicStore();

  // SGPA Logic moved up to avoid React Hook conditionally called error
  const sgpaData = useMemo(() => {
    const grouped: Record<string, { credits: number, points: number }> = {};
    const validSubjects = Array.isArray(activeSubjects) ? activeSubjects : [];
    validSubjects.forEach(s => {
      if (s.credits > 0 && s.grade) {
        const fullKey = `L${s.level}S${s.semester}`;
        if (!grouped[fullKey]) grouped[fullKey] = { credits: 0, points: 0 };
        grouped[fullKey].credits += s.credits;
        grouped[fullKey].points += GRADE_POINTS[s.grade] * s.credits;
      }
    });
    
    return Object.keys(grouped).sort().map(key => ({
      name: key,
      sgpa: grouped[key].points / grouped[key].credits
    }));
  }, [activeSubjects]);

  useEffect(() => {
    if (currentUser) {
      fetchGPAData(currentUser.id);
    }
  }, [currentUser, fetchGPAData]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % numSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, numSlides]);

  if (!isLoaded) {
    return (
      <div className="bg-[#0B0C0E] border border-white/[0.08] rounded-[32px] p-6 shadow-2xl relative flex flex-col items-center justify-center h-full min-h-[220px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/5 mb-4"></div>
          <div className="h-4 w-24 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  let totalCredits = 0;
  let totalPoints = 0;
  
  const validSubjects = Array.isArray(activeSubjects) ? activeSubjects : [];
  
  validSubjects.forEach(c => {
    if (c.credits > 0 && c.grade) {
      const pts = GRADE_POINTS[c.grade] * c.credits;
      totalCredits += c.credits;
      totalPoints += pts;
    }
  });
  
  const currentCGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
  const targetCGPA = predictive.targetGPA || 3.70; 
  const difference = (targetCGPA - currentCGPA).toFixed(2);
  const progressPercent = Math.min((currentCGPA / 4.0) * 100, 100);

  const gradedSubjects = [...validSubjects].filter(s => s.grade).sort((a,b) => {
    if (b.level !== a.level) return b.level - a.level;
    return b.semester - a.semester;
  });
  
  const recentGrades = gradedSubjects.slice(0, 2).map(s => ({
    subject: s.code.substring(0, 9),
    grade: s.grade,
    color: s.grade.includes('A') ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : 
           s.grade.includes('B') ? "text-blue-400 border-blue-500/20 bg-blue-500/10" : 
           "text-purple-400 border-purple-500/20 bg-purple-500/10"
  }));

  // Attendance Logic
  const myAttendances = attendances.filter(a => a.userId === currentUserId);
  const attended = myAttendances.filter(a => a.status === 'attended');
  const missed = myAttendances.filter(a => a.status === 'missed');
  const totalMarked = attended.length + missed.length;
  const attendanceRate = totalMarked === 0 ? 85 : Math.round((attended.length / totalMarked) * 100);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50 && activeSlide < numSlides - 1) {
      setActiveSlide(activeSlide + 1);
    } else if (info.offset.x > 50 && activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    } else if (info.offset.x < -50 && activeSlide === numSlides - 1) {
      setActiveSlide(0); // loop
    } else if (info.offset.x > 50 && activeSlide === 0) {
      setActiveSlide(numSlides - 1);
    }
  };

  if (totalCredits === 0) {
    return (
      <div className="bg-[#0B0C0E] border border-white/[0.08] rounded-[32px] p-6 shadow-2xl relative flex flex-col h-full min-h-[220px] overflow-hidden hover:bg-[#1A1D20] hover:border-white/[0.15] transition-all duration-300">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-indigo-500/15 to-purple-500/5 rounded-full blur-[3rem] pointer-events-none"></div>
        <div className="relative z-10 flex justify-between items-center mb-4 border-b border-[#2a2d36] pb-2">
          <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Academics Overview
          </h3>
        </div>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
          <BookOpen className="w-8 h-8 text-gray-500 mb-3" />
          <p className="text-sm font-bold text-gray-400 mb-4">No results added yet</p>
          <Link href="/academics" className="text-xs uppercase tracking-widest font-bold bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            Setup GPA Calculator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-[#0B0C0E] border border-white/[0.08] rounded-[32px] p-6 shadow-2xl relative flex flex-col h-[280px] overflow-hidden hover:bg-[#1A1D20] hover:border-white/[0.15] transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-indigo-500/15 to-purple-500/5 rounded-full blur-[3rem] pointer-events-none"></div>
      
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-4 border-b border-[#2a2d36] pb-2">
        <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Academics Overview
        </h3>
        <Link href="/academics" className="text-[10px] uppercase tracking-widest font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md hover:bg-indigo-500/20 transition-colors">
          View All
        </Link>
      </div>

      <div className="relative z-10 flex-1 w-full overflow-hidden h-[175px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full h-full flex flex-col cursor-grab active:cursor-grabbing"
          >
            {/* Slide 0: Current CGPA Overview */}
            {activeSlide === 0 && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-end gap-3 mb-1">
                  <span className="font-extrabold text-5xl text-white tracking-tighter">{currentCGPA.toFixed(2)}</span>
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1.5">CGPA</span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <p className="text-xs text-gray-400 font-medium">
                    <span className="text-emerald-400 font-bold">{difference} points</span> away from Target
                  </p>
                </div>

                <div className="w-full bg-[#23252b] h-1.5 rounded-full mt-3 overflow-hidden border border-[#2a2d36]">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#2a2d36]/50">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3 h-3 text-gray-500" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500">Latest Results</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentGrades.length > 0 ? recentGrades.map((grade, idx) => (
                      <div key={idx} className={`px-2.5 py-1 rounded-lg border ${grade.color} flex items-center gap-2`}>
                        <span className="text-[10px] font-bold tracking-wider">{grade.subject}</span>
                        <span className="text-[11px] font-extrabold">{grade.grade}</span>
                      </div>
                    )) : (
                      <span className="text-xs text-gray-500 font-medium">No results recorded yet.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Slide 1: Lecture Attendance */}
            {activeSlide === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" fill="transparent" stroke="#23252b" strokeWidth="6" />
                    <circle 
                      cx="56" cy="56" r="48" 
                      fill="transparent" 
                      stroke={attendanceRate >= 80 ? "#10b981" : attendanceRate >= 60 ? "#f59e0b" : "#ef4444"} 
                      strokeWidth="6" 
                      strokeDasharray="301.59" 
                      strokeDashoffset={301.59 - (301.59 * attendanceRate) / 100} 
                      strokeLinecap="round" 
                      style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-white">{attendanceRate}%</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Overall Attendance</p>
                <span className={`mt-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                  attendanceRate >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                  attendanceRate >= 60 ? 'bg-amber-500/10 text-amber-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>
                  {attendanceRate >= 80 ? "Good Standing" : attendanceRate >= 60 ? "Needs Improvement" : "Critical Warning"}
                </span>
              </div>
            )}

            {/* Slide 2: SGPA Trend Chart */}
            {activeSlide === 2 && (
              <div className="flex-1 flex flex-col justify-end relative h-[140px] mt-2">
                <div className="absolute top-0 left-0 w-full z-10 flex justify-between px-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SGPA Trend (Per Semester)</span>
                </div>
                {sgpaData.length < 2 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 text-xs font-medium text-center">Not enough data to show a trend yet.<br/>(Requires at least 2 semesters)</p>
                  </div>
                ) : (
                  <div className="w-full h-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sgpaData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          <filter id="neonGlowPurple">
                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.8"/>
                          </filter>
                        </defs>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0B0C0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                          labelStyle={{ color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}
                          formatter={(val: any) => [`${Number(val).toFixed(2)} SGPA`, '']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sgpa" 
                          stroke="#8b5cf6" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} 
                          activeDot={{ r: 6 }} 
                          filter="url(#neonGlowPurple)" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="relative z-10 flex justify-center items-center gap-2 mt-4 pt-2">
        {Array.from({ length: numSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`transition-all duration-300 rounded-full ${
              activeSlide === i ? "w-4 h-1.5 bg-indigo-400" : "w-1.5 h-1.5 bg-gray-600 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
