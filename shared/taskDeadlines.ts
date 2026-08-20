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

