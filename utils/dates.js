
function getWeekNumber(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  target.setDate(target.getDate() + 4 - (target.getDay() || 7));
  const yearStart = new Date(target.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);

  return weekNumber;
}


export { getWeekNumber }
