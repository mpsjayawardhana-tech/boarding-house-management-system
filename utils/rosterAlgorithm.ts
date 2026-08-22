import { getISOWeek, format, startOfWeek, addDays } from "date-fns";
import { User, RosterConfig, DaySchedule, Task, UpcomingSwap } from "../store";

export function calculateHistoricalBalances(users: User[], completedTasksHistory: Task[]): Record<string, number> {
  const balances: Record<string, number> = {};
  users.forEach(u => balances[u.id] = 0);
  
  completedTasksHistory.forEach(task => {
    // Supposed to do (Target)
    task.assigneeIds.forEach(id => {
      if (balances[id] !== undefined) balances[id] -= 1; // Debt increases
    });
    // Actually did (Done)
    task.actualAssigneeIds?.forEach(id => {
      if (balances[id] !== undefined) balances[id] += 1; // Surplus increases
    });
  });
  
  return balances;
}

export function generateDeterministicSchedule(
  targetDate: Date,
  users: User[],
  config: RosterConfig,
  completedTasksHistory: any[],
  upcomingSwaps: UpcomingSwap[]
): DaySchedule[] {
  const activeUsers = users?.filter((u) => u.isActive && u.role !== 'super_admin').sort((a, b) => a.id.localeCompare(b.id)) || [];
  const activeDays = config?.activeDays || [];
  const tasks = config?.tasks?.length ? config.tasks : [
    { id: 'sweep', name: 'Sweep the floor', frequency: 'daily', assigneesPerOccurrence: 2 },
    { id: 'mop', name: 'Mop the floor', frequency: 'weekly', occurrencesPerWeek: 1, assigneesPerOccurrence: 2 },
    { id: 'toilet', name: 'Clean Toilet', frequency: 'weekly', occurrencesPerWeek: 1, assigneesPerOccurrence: 1 }
  ] as any[];
  
  if (activeUsers.length === 0 || activeDays.length === 0) {
    return activeDays.map(dayName => ({ dayName, tasks: [] }));
  }

  const isoWeekNumber = getISOWeek(targetDate);
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday is 1
  
  const dayNameToDateMap: Record<string, string> = {};
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  dayNames.forEach((name, i) => {
    dayNameToDateMap[name] = format(addDays(weekStart, i), 'yyyy-MM-dd');
  });

  if (config?.schedulingMode === 'manual') {
    return activeDays.map(dayName => {
      const dayTasks: Task[] = [];
      const dayAssignments = config.manualAssignments?.[dayName] || {};
      
      tasks.forEach(t => {
        const userIds = dayAssignments[t.id] || [];
        if (userIds.length > 0) {
          const dateStr = dayNameToDateMap[dayName];
          const deterministicTaskId = `${t.id}-${dateStr}`;
          const isCompleted = completedTasksHistory.some((ct: any) => ct.id === deterministicTaskId);
          
          dayTasks.push({
            id: deterministicTaskId,
            type: t.id,
            title: t.name,
            assigneeIds: userIds,
            isCompleted
          } as Task);
        }
      });
      
      return {
        dayName,
        tasks: dayTasks
      };
    });
  }
  
  const scheduleDraft: Record<string, Task[]> = {};
  activeDays.forEach(d => { scheduleDraft[d] = []; });
  
  const assignedUsersPerDay: Record<string, Set<string>> = {};
  activeDays.forEach(d => { assignedUsersPerDay[d] = new Set(); });



  // Start with historical balances, we will mutate this during assignment (Greedy Priority Queue)
  const currentBalances = calculateHistoricalBalances(users, completedTasksHistory);

  const getDistinctUsers = (count: number, dayName: string, roundRobinOffset: number): string[] => {
    const ids: string[] = [];
    
    // Create a prioritized array of users for this specific slot
    const prioritizedUsers = [...activeUsers].sort((a, b) => {
      const balanceDiff = currentBalances[a.id] - currentBalances[b.id];
      if (balanceDiff !== 0) return balanceDiff; // Ascending: Lowest balance (highest debt) first
      
      // Tie breaker: Deterministic Round-Robin based on offset
      const idxA = activeUsers.findIndex(u => u.id === a.id);
      const idxB = activeUsers.findIndex(u => u.id === b.id);
      const distA = (idxA - roundRobinOffset + activeUsers.length) % activeUsers.length;
      const distB = (idxB - roundRobinOffset + activeUsers.length) % activeUsers.length;
      return distA - distB;
    });

    for (const user of prioritizedUsers) {
      if (ids.length >= count) break;
      if (!assignedUsersPerDay[dayName].has(user.id)) {
        ids.push(user.id);
        assignedUsersPerDay[dayName].add(user.id);
        // Temporarily increment their balance so they aren't monopolized for the rest of the week
        currentBalances[user.id] += 1; 
      }
    }
    
    // Fallback if we couldn't find distinct users (e.g., asking for more assignees than active users)
    if (ids.length < count) {
      let fallbackIndex = 0;
      while (ids.length < count) {
        const fallbackUser = prioritizedUsers[fallbackIndex % prioritizedUsers.length];
        ids.push(fallbackUser.id);
        currentBalances[fallbackUser.id] += 1;
        fallbackIndex++;
      }
    }
    
    return ids;
  };

  const applySwaps = (taskId: string, defaultAssignees: string[]) => {
    let currentAssignees = [...defaultAssignees];
    currentAssignees = currentAssignees.map(userId => {
      const swapIdx = upcomingSwaps.findIndex(s => s.taskType === taskId && s.fromUserId === userId);
      if (swapIdx !== -1) {
        return upcomingSwaps[swapIdx].toUserId;
      }
      return userId;
    });
    return currentAssignees;
  };

  let globalOffset = isoWeekNumber % activeUsers.length;

  tasks.forEach(t => {
    let occurrences = t.frequency === 'daily' ? activeDays.length : (t.occurrencesPerWeek || 0);
    if (occurrences === 0 || t.assigneesPerOccurrence === 0) return;
    
    const targetDays = t.frequency === 'daily' 
      ? activeDays 
      : (t.targetDays && t.targetDays.length > 0 ? t.targetDays.filter((d: string) => activeDays.includes(d)) : [...activeDays].sort().slice(0, occurrences)); // Deterministic distribution fallback

    targetDays.forEach((dayName: string) => {
      const ids = getDistinctUsers(t.assigneesPerOccurrence, dayName, globalOffset);
      
      // Increment offset so tie-breaker rotates fairly among those with identical balances
      globalOffset = (globalOffset + ids.length) % activeUsers.length;
      
      const assignees = applySwaps(t.id, ids);
      const dateStr = dayNameToDateMap[dayName];
      const deterministicTaskId = `${t.id}-${dateStr}`; // Unique stable ID per day
      
      const isCompleted = completedTasksHistory.some((ct: any) => ct.id === deterministicTaskId);
      
      scheduleDraft[dayName].push({
        id: deterministicTaskId,
        type: t.id,
        title: t.name,
        assigneeIds: assignees,
        isCompleted
      } as Task);
    });
  });

  return activeDays.map(dayName => ({
    dayName,
    tasks: scheduleDraft[dayName]
  }));
}
