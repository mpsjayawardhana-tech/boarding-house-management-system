"use client";

import { useAppStore } from "@/store";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, MapPin, Clock, GripVertical } from "lucide-react";
import { useState, useMemo } from "react";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function MiniTimetableWidget({ isEditMode }: { isEditMode?: boolean }) {
  const { courses = [], enrollments = {}, currentUserId, timetableConfig } = useAppStore();
  const currentDayName = format(new Date(), 'EEEE');
  const rawEnrollments = enrollments[currentUserId] || [];
  
  // Calculate effective enrollments including mandatory subjects
  const effectiveEnrollments = useMemo(() => {
    let effective = [...rawEnrollments];
    const mandatoryBases = timetableConfig?.mandatoryBaseCourses || [];
    
    courses.forEach(c => {
      const baseCodeMatch = c.code?.match(/^(.*?)(?:\s*\(|$)/);
      const baseCode = baseCodeMatch ? baseCodeMatch[1].trim() : (c.code || '');
      
      if (mandatoryBases.includes(baseCode) && !c.code?.includes('(P)') && !c.code?.includes('Lab') && !c.name.includes('Practical') && !c.name.includes('Lab')) {
        if (!effective.includes(c.id)) effective.push(c.id);
      }
    });
    
    return effective;
  }, [rawEnrollments, courses, timetableConfig?.mandatoryBaseCourses]);
  
  // Default to today if it's a weekday, otherwise Monday
  const initialDay = DAYS.includes(currentDayName) ? currentDayName : 'Monday';
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const todaysSessions = useMemo(() => {
    const sessions: any[] = [];
    const enrolledCourses = courses.filter(c => effectiveEnrollments.includes(c.id));
    
    enrolledCourses.forEach(course => {
      course.sessions.forEach(session => {
        if (session.dayOfWeek === selectedDay) {
          sessions.push({
            courseCode: course.code,
            courseName: course.name,
            ...session
          });
        }
      });
    });
    
    // Sort by start time
    return sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [courses, selectedDay]);

  return (
    <div className="h-full bg-[#0B0C0E] border border-white/[0.08] rounded-[32px] p-6 shadow-2xl relative flex flex-col hover:bg-[#1A1D20] hover:border-white/[0.15] transition-all duration-300 overflow-hidden min-h-[350px]">
      {isEditMode && (
        <div className="absolute top-4 left-4 z-20 p-2 bg-white/10 rounded-full cursor-grab active:cursor-grabbing text-white/50 hover:text-white transition-colors">
          <GripVertical className="w-5 h-5" />
        </div>
      )}
      
      <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-gradient-to-tl from-indigo-500/15 to-purple-500/10 rounded-full blur-[4rem] pointer-events-none"></div>
      
      <div className="relative z-10 flex justify-between items-center mb-6 border-b border-[#2a2d36] pb-4">
        <h3 className={`text-[10px] uppercase tracking-widest font-extrabold text-white ${isEditMode ? 'ml-10' : ''}`}>
          Timetable
        </h3>
        <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1 max-w-[200px] md:max-w-xs">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-bold shrink-0 transition-all ${
                selectedDay === day 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {todaysSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#2a2d36] rounded-2xl bg-black/20 text-center">
                <BookOpen className="w-8 h-8 text-gray-500 mb-3 opacity-50" />
                <p className="text-gray-400 text-sm font-medium">No classes scheduled for {selectedDay}.</p>
              </div>
            ) : (
              todaysSessions.map((session, idx) => (
                <div key={`${session.courseCode}-${idx}`} className="flex flex-col p-4 rounded-2xl bg-black/20 border border-[#2a2d36] hover:bg-white/5 transition-colors gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col">
                      <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{session.courseCode}</span>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{session.courseName}</h4>
                    </div>
                    <span className="shrink-0 px-2 py-1 bg-white/5 rounded-md text-[10px] uppercase tracking-widest text-gray-400 font-bold border border-white/10">
                      {session.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mt-1">
                    <span className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {session.startTime} - {session.endTime}
                    </span>
                    {session.room && (
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="truncate">{session.room}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
