export function isTaskOverdue(dueDate: string | null | undefined, isCompleted: boolean, today = new Date()) {
  if (!dueDate || isCompleted) return false;
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return dueDate < localToday;
}

export function isTaskDueToday(dueDate: string | null | undefined, isCompleted: boolean, today = new Date()) {
  if (!dueDate || isCompleted) return false;
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return dueDate === localToday;
}

/** Considera el día actual y los tres días siguientes como ventana de recordatorio. */
export function isTaskDueSoon(dueDate: string | null | undefined, isCompleted: boolean, today = new Date(), daysAhead = 3) {
  if (!dueDate || isCompleted) return false;
  const [year, month, day] = dueDate.split("-").map(Number);
  if (!year || !month || !day) return false;
  const startOfToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const targetDate = Date.UTC(year, month - 1, day);
  const remainingDays = Math.round((targetDate - startOfToday) / 86_400_000);
  return remainingDays >= 0 && remainingDays <= daysAhead;
}
