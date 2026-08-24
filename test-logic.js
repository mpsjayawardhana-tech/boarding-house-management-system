const completedTasksHistory = [
  { id: 'sweep-2026-08-24', actualAssigneeIds: ['1'] },
  { id: 'mop-2026-08-23', actualAssigneeIds: ['1'] }
];
const currentUser = { id: '1' };

const today = new Date('2026-08-24T12:00:00Z');
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();
const completedCounts = [0, 0, 0, 0];

completedTasksHistory.forEach(task => {
  if (task.actualAssigneeIds?.includes(currentUser.id)) {
    const dateMatch = task.id.match(/\d{4}-\d{2}-\d{2}$/);
    if (dateMatch) {
      const [y, m, d] = dateMatch[0].split('-');
      const taskDate = new Date(Number(y), Number(m)-1, Number(d));
      if (taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear) {
        const dayOfMonth = taskDate.getDate();
        const binIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
        completedCounts[binIndex]++;
        console.log(`Matched task on day ${dayOfMonth}, put in bin ${binIndex}`);
      } else {
        console.log('Month mismatch!', taskDate.getMonth(), currentMonth);
      }
    }
  }
});

console.log(completedCounts);
