"use client";

import { useAppStore } from "@/store";
import { format, isWithinInterval, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { BookOpen, Check, CheckCircle2, ChevronRight, Clock, Crown, GraduationCap, X, XCircle, Settings2, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";

export default function AcademicsPage() {
  const { 
    users, currentUserId = '1', 
    courses, holidays, attendances, timetableConfig,
    markAttendance, removeAttendance,
    enrollments, toggleCourseEnrollment
  } = useAppStore();

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const todayDateStr = format(new Date(), 'yyyy-MM-dd');
  
  // Find current day name (e.g., 'Monday')
  const currentDayName = format(new Date(), 'EEEE');

  const myEnrollments = enrollments[currentUser.id] || [];
  const [isEditingSubjects, setIsEditingSubjects] = useState(myEnrollments.length === 0);

  // Check if today is a holiday
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

  const myEnrolledCourses = useMemo(() => {
    return courses.filter(c => myEnrollments.includes(c.id));
  }, [courses, myEnrollments]);

  const allMySessions = useMemo(() => {
    const arr: { course: typeof courses[0], session: typeof courses[0]['sessions'][0] }[] = [];
    myEnrolledCourses.forEach(course => {
      (course.sessions || []).forEach(session => {
        arr.push({ course, session });
      });
    });
    return arr;
  }, [myEnrolledCourses]);

  // Fetch today's enrolled sessions
  const todaySessions = useMemo(() => {
    return allMySessions
      .filter(s => s.session.dayOfWeek === currentDayName)
      .sort((a, b) => a.session.startTime.localeCompare(b.session.startTime));
  }, [allMySessions, currentDayName]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.map(course => {
            const isEnrolled = myEnrollments.includes(course.id);
            return (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={course.id}
                onClick={() => toggleCourseEnrollment(currentUser.id, course.id)}
                className={`relative flex flex-col items-start text-left p-5 rounded-2xl border transition-all ${isEnrolled ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-[#0B0C0E] border-[#2a2d36] hover:border-white/20'}`}
              >
                {isEnrolled && (
                  <div className="absolute top-4 right-4 bg-emerald-500 rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className={`text-xs font-bold mb-1 ${isEnrolled ? 'text-emerald-400' : 'text-gray-500'}`}>{course.code || 'NO-CODE'}</span>
                <span className="font-bold text-white text-sm mb-2">{course.name}</span>
                <span className="text-xs text-gray-400 font-medium">{course.creditHours} Credits • {course.sessions?.length || 0} Sessions/wk</span>
              </motion.button>
            )
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
                    todaySessions.map(({ course, session }, idx) => {
                      // Note: We use the course ID and date to find the attendance record. 
                      // If there are multiple sessions for a course on the same day, they will all share the same attendance record.
                      const record = attendances.find(a => a.userId === currentUser.id && a.courseId === course.id && a.date === todayDateStr);
                      
                      let typeColor = 'bg-gray-500';
                      let typeText = 'text-gray-400';
                      let typeBorder = 'border-gray-500/20';
                      if (session.type === 'Lecture') { typeColor = 'bg-emerald-500/10'; typeText = 'text-emerald-400'; typeBorder = 'border-emerald-500/20'; }
                      else if (session.type === 'Practical') { typeColor = 'bg-blue-500/10'; typeText = 'text-blue-400'; typeBorder = 'border-blue-500/20'; }
                      else if (session.type === 'Tutorial') { typeColor = 'bg-purple-500/10'; typeText = 'text-purple-400'; typeBorder = 'border-purple-500/20'; }

                      return (
                        <div key={`${course.id}-${idx}`} className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeColor} ${typeText} ${typeBorder}`}>{session.type}</span>
                              <span className="text-xs font-bold text-gray-400">{course.code}</span>
                            </div>
                            <span className="font-bold text-white text-lg mt-1">{course.name}</span>
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
                                  onClick={() => markAttendance(currentUser.id, course.id, todayDateStr, 'missed')}
                                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                                >
                                  Missed
                                </motion.button>
                                <motion.button 
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => markAttendance(currentUser.id, course.id, todayDateStr, 'attended')}
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
              const daySessions = allMySessions
                .filter(s => s.session.dayOfWeek === day)
                .sort((a, b) => a.session.startTime.localeCompare(b.session.startTime));

              return (
                <div key={day} className="flex flex-col gap-3">
                  <h4 className="text-white/50 text-sm uppercase tracking-wider font-bold mb-2 pb-2 border-b border-[#2a2d36]">{day}</h4>
                  
                  {daySessions.length === 0 ? (
                    <div className="text-gray-500 text-xs italic opacity-50">No classes</div>
                  ) : (
                    daySessions.map(({ course, session }, idx) => {
                      let typeColor = 'bg-gray-500';
                      let typeLabel = 'U';
                      if (session.type === 'Lecture') { typeColor = 'bg-emerald-500'; typeLabel = 'L'; }
                      else if (session.type === 'Practical') { typeColor = 'bg-blue-500'; typeLabel = 'P'; }
                      else if (session.type === 'Tutorial') { typeColor = 'bg-purple-500'; typeLabel = 'T'; }

                      return (
                        <div key={`${course.id}-${idx}`} className="bg-[#131418] border border-white/5 rounded-[1rem] p-4 hover:bg-white/[0.02] hover:border-white/10 transition-all flex flex-col relative group overflow-hidden">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`${typeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center justify-center min-w-[20px]`}>{typeLabel}</span>
                            <span className="text-white/90 font-medium text-xs truncate">{course.code}</span>
                          </div>
                          <span className="text-white/50 text-[11px] leading-tight line-clamp-2" title={course.name}>{course.name}</span>
                          
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
