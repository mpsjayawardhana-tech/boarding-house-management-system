"use client";

import { useState, useMemo } from 'react';
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAcademicStore, GRADE_POINTS } from '@/store/academicStore';

export function TargetGPAPredictor() {
  const { activeSubjects } = useAcademicStore();
  
  const { currentCGPA, completedCredits } = useMemo(() => {
    let credits = 0;
    let points = 0;
    const validSubjects = Array.isArray(activeSubjects) ? activeSubjects : [];
    validSubjects.forEach(s => {
      if (s.credits > 0 && s.grade && GRADE_POINTS[s.grade as keyof typeof GRADE_POINTS] !== undefined) {
        credits += s.credits;
        points += GRADE_POINTS[s.grade as keyof typeof GRADE_POINTS] * s.credits;
      }
    });
    return { currentCGPA: credits > 0 ? points / credits : 0, completedCredits: credits };
  }, [activeSubjects]);

  const [targetCGPA, setTargetCGPA] = useState<number>(3.70);
  const [totalDegreeCredits, setTotalDegreeCredits] = useState<number>(120);

  // Math Logic
  const totalRequiredGradePoints = targetCGPA * totalDegreeCredits;
  const currentGradePoints = currentCGPA * completedCredits;
  const remainingCredits = totalDegreeCredits - completedCredits;
  
  let requiredFutureGPA = 0;
  if (remainingCredits > 0) {
    requiredFutureGPA = (totalRequiredGradePoints - currentGradePoints) / remainingCredits;
  }

  // Determine Message
  let message = "";
  let type: 'neutral' | 'success' | 'error' | 'info' = 'neutral';

  if (completedCredits === 0) {
    message = "Add some completed subjects first to predict your future.";
    type = 'info';
  } else if (remainingCredits <= 0) {
    message = "You have already completed or exceeded your degree credits.";
    type = 'info';
  } else if (requiredFutureGPA > 4.0) {
    message = "Mathematically Impossible (Requires > 4.0 GPA)";
    type = 'error';
  } else if (requiredFutureGPA <= 0) {
    message = "Target already achieved! Just maintain passing grades.";
    type = 'success';
  } else {
    message = `You need to maintain an average GPA of ${requiredFutureGPA.toFixed(2)} for your remaining ${remainingCredits} credits.`;
    type = 'neutral';
  }

  return (
    <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 relative overflow-hidden flex flex-col h-fit">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[3rem] pointer-events-none"></div>
      
      <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2 relative z-10">
        <Target className="w-5 h-5 text-purple-400" /> Target CGPA Predictor
      </h3>
      
      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">Target CGPA</label>
          <input 
            type="number" 
            step="0.01" 
            min="0" 
            max="4.0"
            value={targetCGPA}
            onChange={e => setTargetCGPA(parseFloat(e.target.value) || 0)}
            className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-purple-500/50 focus:outline-none"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">Total Degree Credits</label>
          <select 
            value={totalDegreeCredits}
            onChange={e => setTotalDegreeCredits(Number(e.target.value))}
            className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-purple-500/50 focus:outline-none"
          >
            <option value={90}>90 Credits (3-Year Degree)</option>
            <option value={120}>120 Credits (4-Year Degree)</option>
          </select>
        </div>

        <div className={`mt-2 p-4 rounded-2xl flex flex-col items-center justify-center text-center border transition-colors ${
          type === 'error' ? 'bg-rose-500/10 border-rose-500/20' : 
          type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
          type === 'info' ? 'bg-blue-500/10 border-blue-500/20' :
          'bg-purple-500/10 border-purple-500/20'
        }`}>
          {type === 'error' && <AlertTriangle className="w-6 h-6 text-rose-400 mb-2" />}
          {type === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-2" />}
          
          {type === 'neutral' ? (
            <>
              <span className="text-xs font-bold text-purple-500/70 uppercase tracking-widest">Required Future GPA</span>
              <span className="text-3xl font-extrabold text-purple-400 mt-1">{requiredFutureGPA.toFixed(2)}</span>
              <span className="text-xs text-gray-400 mt-2 font-medium max-w-[220px] leading-relaxed">
                You need to maintain an average GPA of <span className="text-white">{requiredFutureGPA.toFixed(2)}</span> for your remaining <span className="text-white">{remainingCredits}</span> credits.
              </span>
            </>
          ) : (
            <span className={`text-sm font-bold mt-1 max-w-[220px] leading-relaxed ${
              type === 'error' ? 'text-rose-400' :
              type === 'success' ? 'text-emerald-400' :
              'text-blue-400'
            }`}>{message}</span>
          )}
        </div>
      </div>
    </div>
  );
}
