"use client";

import { useAppStore } from "@/store";
import { format, isWithinInterval, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { BookOpen, Check, CheckCircle2, ChevronRight, Clock, Crown, GraduationCap, X, XCircle, Settings2, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default function AcademicsPage() {
  const { 
    users, currentUserId = '1', 
    courses, holidays, attendances, timetableConfig,
    markAttendance, removeAttendance,
    enrollments, toggleCourseEnrollment, setEnrollments
  } = useAppStore();

  const currentUser = users.find(u => u.id === currentUserId);
  if (!currentUser) return null;
  const todayDateStr = format(new Date(), 'yyyy-MM-dd');
  
  // Find current day name (e.g., 'Monday')
  const currentDayName = format(new Date(), 'EEEE');

  const rawEnrollments = enrollments[currentUser.id] || [];
  
  // Group courses by base code
  const groupedCourses = useMemo(() => {
    const groups: Record<string, { baseCode: string, name: string, mandatory: typeof courses, practicals: typeof courses }> = {};
    
    courses.forEach(c => {
      const baseCodeMatch = c.code?.match(/^(.*?)(?:\s*\(|$)/);
      const baseCode = baseCodeMatch ? baseCodeMatch[1].trim() : (c.code || 'UNKNOWN');
      
      const baseNameMatch = c.name.match(/^(.*?)(?:\s*\(|$)/);
      const baseName = baseNameMatch ? baseNameMatch[1].trim() : c.name;
      
      if (!groups[baseCode]) {
        groups[baseCode] = { baseCode, name: baseName, mandatory: [], practicals: [] };
      }
      
      if (c.code?.includes('(P)') || c.code?.includes('Lab') || c.name.includes('Practical') || c.name.includes('Lab')) {
        groups[baseCode].practicals.push(c);
      } else {
        groups[baseCode].mandatory.push(c);
      }
    });
    
    return Object.values(groups);
  }, [courses]);

  // Compute effective enrollments (including global mandatory base courses)
  const myEnrollments = useMemo(() => {
    let effective = [...rawEnrollments];
    const mandatoryBases = timetableConfig.mandatoryBaseCourses || [];
    
    groupedCourses.forEach(group => {
      if (mandatoryBases.includes(group.baseCode)) {
        group.mandatory.forEach(c => {
          if (!effective.includes(c.id)) effective.push(c.id);
        });
      }
    });
    
    return effective;
  }, [rawEnrollments, groupedCourses, timetableConfig.mandatoryBaseCourses]);

  const [isEditingSubjects, setIsEditingSubjects] = useState(myEnrollments.length === 0);
  const [expandedCourseGroup, setExpandedCourseGroup] = useState<string | null>(null);

  const activeHoliday = useMemo(() => {
    const today = new Date();
    return holidays.find(h => {
      try {
        const start = parseISO(h.startDate);
        const end = parseISO(h.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return isWithinInterval(today, { start, end });
      } catch (e) {
        return false;
      }
    });
  }, [holidays]);

  const enrolledCourses = useMemo(() => {
    return courses.filter(c => myEnrollments.includes(c.id));
  }, [courses, myEnrollments]);

  const getSessionsForDay = (day: string) => {
    return enrolledCourses.flatMap(course => 
      (course.sessions || [])
        .filter(session => session.dayOfWeek === day)
        .map(session => ({ ...session, courseCode: course.code, courseName: course.name, courseId: course.id }))
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Fetch today's enrolled sessions
  const todaySessions = useMemo(() => getSessionsForDay(currentDayName), [enrolledCourses, currentDayName]);

  // Calculate Personal Stats
  const personalStats = useMemo(() => {
    const myAttendances = attendances.filter(a => a.userId === currentUser.id);
    const attended = myAttendances.filter(a => a.status === 'attended');
    const missed = myAttendances.filter(a => a.status === 'missed');
    
    const totalMarked = attended.length + missed.length;
    const attendanceRate = totalMarked === 0 ? 100 : Math.round((attended.length / totalMarked) * 100);

    const totalHours = attended.reduce((sum, record) => {
      const course = courses.find(c => c.id === record.courseId);
      return sum + (course ? course.creditHours : 0);
    }, 0);

    return { rate: attendanceRate, totalHours, attendedCount: attended.length, missedCount: missed.length };
  }, [attendances, currentUser, courses]);

  // Calculate Leaderboard
  const leaderboard = useMemo(() => {
    const activeUsers = users.filter(u => u.isActive);
    
    const stats = activeUsers.map(user => {
      const userAttendances = attendances.filter(a => a.userId === user.id && a.status === 'attended');
      const totalHours = userAttendances.reduce((sum, record) => {
        const course = courses.find(c => c.id === record.courseId);
        return sum + (course ? course.creditHours : 0);
      }, 0);
      return { user, totalHours };
    });

    return stats.sort((a, b) => b.totalHours - a.totalHours);
  }, [users, attendances, courses]);

  const topScore = leaderboard.length > 0 ? leaderboard[0].totalHours : 0;
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

  if (isEditingSubjects) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full h-full flex flex-col gap-6 pb-10"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Settings2 className="w-8 h-8 text-emerald-400" />
              Course Setup
            </h1>
            <p className="text-gray-400 mt-1">Select the specific subjects you are enrolled in this semester.</p>
          </div>
          {myEnrollments.length > 0 && (
            <button 
              onClick={() => setIsEditingSubjects(false)}
              className="px-6 py-2.5 rounded-full font-bold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {groupedCourses.map(group => {
            const isGloballyMandatory = (timetableConfig.mandatoryBaseCourses || []).includes(group.baseCode);
            const groupCourseIds = [...group.mandatory, ...group.practicals].map(c => c.id);
            const isBaseEnrolled = groupCourseIds.some(id => myEnrollments.includes(id)) || isGloballyMandatory;
            const isExpanded = expandedCourseGroup === group.baseCode;
            
            // Find which practical is currently selected (if any)
            const selectedPracticalId = group.practicals.find(c => myEnrollments.includes(c.id))?.id;

            return (
              <div key={group.baseCode} className={`flex flex-col rounded-3xl border transition-all overflow-hidden ${isBaseEnrolled ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0B0C0E] border-[#2a2d36]'}`}>
                {/* Main Card Header */}
                <div className="flex items-center justify-between p-6">
                  <button 
                    disabled={isGloballyMandatory}
                    onClick={() => {
                      if (isGloballyMandatory) return; // Prevent toggling if it's forced
                      
                      if (isBaseEnrolled) {
                        // Unenroll from everything in this base course
                        setEnrollments(currentUser.id, rawEnrollments.filter(id => !groupCourseIds.includes(id)));
                      } else {
                        // Enroll in all mandatory courses automatically
                        const mandatoryIds = group.mandatory.map(c => c.id);
                        setEnrollments(currentUser.id, [...rawEnrollments, ...mandatoryIds]);
                        
                        // Auto-expand if practicals exist
                        if (group.practicals.length > 0) {
                          setExpandedCourseGroup(group.baseCode);
                        }
                      }
                    }}
                    className={`flex-1 flex items-center gap-4 text-left group ${isGloballyMandatory ? 'cursor-not-allowed opacity-80' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors ${isBaseEnrolled ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 group-hover:border-emerald-500/50'}`}>
                      {isBaseEnrolled && <Check className="w-4 h-4 text-black" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-bold ${isBaseEnrolled ? 'text-emerald-400' : 'text-white'}`}>{group.baseCode}</h3>
                        {isGloballyMandatory && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase border border-emerald-500/30">Mandatory</span>}
                      </div>
                      <p className="text-sm text-gray-400 font-medium">{group.name}</p>
                    </div>
                  </button>

                  {/* Expand toggle for practicals */}
                  {group.practicals.length > 0 && (
                    <button 
                      onClick={() => setExpandedCourseGroup(isExpanded ? null : group.baseCode)}
                      className={`ml-4 p-2 rounded-full transition-colors ${isBaseEnrolled ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-gray-500 hover:bg-white/5'}`}
                    >
                      <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Practical Sub-selector */}
                {group.practicals.length > 0 && isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#2a2d36]/50 bg-black/20">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Practical Group</p>
                    <div className="flex flex-wrap gap-2">
                      {group.practicals.map(practical => {
                        const isSelected = selectedPracticalId === practical.id;
                        return (
                          <button
                            key={practical.id}
                            onClick={() => {
                              // Remove all existing practicals for this group
                              const practicalIds = group.practicals.map(p => p.id);
                              const cleanedEnrollments = rawEnrollments.filter(id => !practicalIds.includes(id));
                              
                              // Add the selected one
                              setEnrollments(currentUser.id, [...cleanedEnrollments, practical.id]);
                              
                              // Ensure mandatory are added if they weren't (safety net, unless globally mandatory)
                              if (!isBaseEnrolled && !isGloballyMandatory) {
                                const mandatoryIds = group.mandatory.map(c => c.id);
                                setEnrollments(currentUser.id, [...cleanedEnrollments, practical.id, ...mandatoryIds]);
                              }
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${isSelected ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-[#1C1E22] text-gray-400 border-[#2a2d36] hover:border-emerald-500/30 hover:text-emerald-400'}`}
                          >
                            {/* Extract group name like "Group I" */}
                            {practical.name.match(/Group [IVX]+/) ? practical.name.match(/Group [IVX]+/)?.[0] : 'Lab / Practical'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <button 
            onClick={() => setIsEditingSubjects(false)}
            disabled={myEnrollments.length === 0}
            className="px-8 py-3 rounded-xl font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {myEnrollments.length === 0 ? 'Select at least one subject' : 'Save My Subjects'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full flex flex-col gap-6 pb-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-emerald-400" />
            Academics
          </h1>
          <p className="text-gray-400 mt-1">Manage your university attendance and track your progress.</p>
        </div>
        <button 
          onClick={() => setIsEditingSubjects(true)}
          className="px-5 py-2 rounded-xl font-bold text-sm bg-[#141618] hover:bg-[#23252b] text-gray-300 border border-[#2a2d36] transition-colors"
        >
          Edit Subjects
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center justify-between border-b border-[#2a2d36] pb-4 mb-6">
              <div>
                <h3 className="font-extrabold text-xl tracking-tight text-white">Today's Schedule</h3>
                <p className="text-sm text-gray-400">{currentDayName}, {format(new Date(), 'MMMM do, yyyy')}</p>
              </div>
            </div>

            <div className="relative z-10">
              {activeHoliday ? (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                  <BookOpen className="w-12 h-12 text-blue-400 mb-4 relative z-10" />
                  <h3 className="text-xl font-bold text-white relative z-10">University Closed Today</h3>
                  <p className="text-blue-300 font-medium mt-2 relative z-10">{activeHoliday.title}</p>
                  {activeHoliday.isLongVacation && (
                    <span className="mt-4 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase relative z-10">Long Vacation</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {todaySessions.length === 0 ? (
                    <div className="bg-black/20 border border-dashed border-[#2a2d36] rounded-2xl p-8 text-center">
                      <p className="text-gray-400 font-medium">No enrolled classes scheduled for today.</p>
                      <p className="text-xs text-gray-500 mt-1">Enjoy your free day!</p>
                    </div>
                  ) : (
                    todaySessions.map((session, idx) => {
                      // Note: We use the course ID and date to find the attendance record. 
                      // If there are multiple sessions for a course on the same day, they will all share the same attendance record.
                      const record = attendances.find(a => a.userId === currentUser.id && a.courseId === session.courseId && a.date === todayDateStr);
                      
                      let typeColor = 'bg-gray-500';
                      let typeText = 'text-gray-400';
                      let typeBorder = 'border-gray-500/20';
                      if (session.type === 'Lecture') { typeColor = 'bg-emerald-500/10'; typeText = 'text-emerald-400'; typeBorder = 'border-emerald-500/20'; }
                      else if (session.type === 'Practical') { typeColor = 'bg-blue-500/10'; typeText = 'text-blue-400'; typeBorder = 'border-blue-500/20'; }
                      else if (session.type === 'Tutorial') { typeColor = 'bg-purple-500/10'; typeText = 'text-purple-400'; typeBorder = 'border-purple-500/20'; }

                      return (
                        <div key={`${session.courseId}-${idx}`} className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeColor} ${typeText} ${typeBorder}`}>{session.type}</span>
                              <span className="text-xs font-bold text-gray-400">{session.courseCode}</span>
                            </div>
                            <span className="font-bold text-white text-lg mt-1">{session.courseName}</span>
                            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-400 mt-1">
                              <span className="flex items-center gap-1 text-[#00ff9d]"><Clock className="w-4 h-4" /> {session.startTime} - {session.endTime}</span>
                              {session.room && (
                                <>
                                  <span className="text-gray-500">•</span>
                                  <span className="flex items-center gap-1 text-gray-300"><MapPin className="w-3.5 h-3.5" /> {session.room}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!record ? (
                              <>
                                <motion.button 
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => markAttendance(currentUser.id, session.courseId, todayDateStr, 'missed')}
                                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                                >
                                  Missed
                                </motion.button>
                                <motion.button 
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => markAttendance(currentUser.id, session.courseId, todayDateStr, 'attended')}
                                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                                >
                                  Attended
                                </motion.button>
                              </>
                            ) : (
                              <div className="flex items-center gap-3">
                                {record.status === 'attended' ? (
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                                    <CheckCircle2 className="w-4 h-4" /> Attended
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-sm font-bold border border-rose-500/20">
                                    <XCircle className="w-4 h-4" /> Missed
                                  </span>
                                )}
                                <button 
                                  onClick={() => removeAttendance(record.id)}
                                  className="text-xs text-gray-500 hover:text-white underline decoration-dashed underline-offset-4"
                                >
                                  Undo
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="flex flex-col gap-6">
          
          {/* Personal Stats */}
          <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[3rem] pointer-events-none"></div>
            
            <h3 className="font-extrabold text-lg tracking-tight text-white mb-6 relative z-10 w-full text-left border-b border-[#2a2d36] pb-3">Your Attendance</h3>
            
            <div className="relative z-10 mb-4">
              <div className="w-32 h-32 rounded-full border-[8px] border-[#2a2d36] flex items-center justify-center relative shadow-inner">
                {/* Visual Fake Progress Ring - Tailwind doesn't do conic gradients easily without arbitrary values, so we use a trick or just raw text */}
                <div className="absolute inset-0 rounded-full border-[8px] border-emerald-400 opacity-20" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${personalStats.rate}%, 0 ${personalStats.rate}%)` }}></div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white">{personalStats.rate}%</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Attendance</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full grid grid-cols-2 gap-3 mt-2">
              <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500 font-bold uppercase mb-1">Hours Attended</span>
                <span className="text-xl font-extrabold text-emerald-400">{personalStats.totalHours}</span>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500 font-bold uppercase mb-1">Classes Missed</span>
                <span className="text-xl font-extrabold text-rose-400">{personalStats.missedCount}</span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 relative overflow-hidden flex flex-col flex-1">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 rounded-full translate-y-1/3 translate-x-1/3 blur-[3rem] pointer-events-none"></div>
            
            <h3 className="font-extrabold text-lg tracking-tight text-white mb-4 relative z-10 border-b border-[#2a2d36] pb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Roommate Leaderboard
            </h3>

            <div className="relative z-10 flex flex-col gap-4 overflow-y-auto pr-2 max-h-[300px]">
              {leaderboard.map((entry, index) => {
                const progressWidth = topScore > 0 ? (entry.totalHours / topScore) * 100 : 0;
                const isCurrentUser = entry.user.id === currentUser.id;

                return (
                  <div key={entry.user.id} className={`flex flex-col gap-2 p-3 rounded-2xl border ${isCurrentUser ? 'bg-white/5 border-white/10' : 'bg-black/20 border-transparent'} transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs bg-[#23252b] text-gray-400">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <Image src={entry.user.avatar} alt={entry.user.name} width={24} height={24} className="rounded-full bg-black/50" />
                          <span className={`text-sm font-bold ${isCurrentUser ? 'text-white' : 'text-gray-300'}`}>{entry.user.name}</span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-400">{entry.totalHours} hrs</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#23252b] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressWidth}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 'bg-emerald-500'}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Full Weekly Timetable */}
      <div className="mt-8 flex flex-col gap-4">
        <h3 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2 px-2">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          My Weekly Timetable
        </h3>
        <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
            {daysOfWeek.map(day => {
              const daySessions = getSessionsForDay(day);

              return (
                <div key={day} className="flex flex-col gap-3">
                  <h4 className="text-white/50 text-sm uppercase tracking-wider font-bold mb-2 pb-2 border-b border-[#2a2d36]">{day}</h4>
                  
                  {daySessions.length === 0 ? (
                    <div className="text-gray-500 text-xs italic opacity-50">No classes</div>
                  ) : (
                    daySessions.map((session, idx) => {
                      let typeColor = 'bg-gray-500';
                      let typeLabel = 'U';
                      if (session.type === 'Lecture') { typeColor = 'bg-emerald-500'; typeLabel = 'L'; }
                      else if (session.type === 'Practical') { typeColor = 'bg-blue-500'; typeLabel = 'P'; }
                      else if (session.type === 'Tutorial') { typeColor = 'bg-purple-500'; typeLabel = 'T'; }

                      return (
                        <div key={`${session.courseId}-${idx}`} className="bg-[#131418] border border-white/5 rounded-[1rem] p-4 hover:bg-white/[0.02] hover:border-white/10 transition-all flex flex-col relative group overflow-hidden">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`${typeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center justify-center min-w-[20px]`}>{typeLabel}</span>
                            <span className="text-white/90 font-medium text-xs truncate">{session.courseCode}</span>
                          </div>
                          <span className="text-white/50 text-[11px] leading-tight line-clamp-2" title={session.courseName}>{session.courseName}</span>
                          
                          <div className="mt-3 flex flex-col gap-1">
                            <div className="text-[#00ff9d] text-[11px] flex items-center gap-1 font-mono">
                              <Clock size={12} />
                              {session.startTime} - {session.endTime}
                            </div>
                            {session.room && (
                              <div className="text-gray-400 text-[10px] flex items-center gap-1">
                                <MapPin size={10} />
                                {session.room}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
