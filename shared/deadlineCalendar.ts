export type DeadlineCalendarEntry = {
  taskKey: string;
  dueDate: string;
  title: string;
  phaseName: string;
  isCompleted: boolean;
};

export function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function groupDeadlineEntries(entries: DeadlineCalendarEntry[]) {
  const grouped = new Map<string, DeadlineCalendarEntry[]>();
  entries.forEach(entry => grouped.set(entry.dueDate, [...(grouped.get(entry.dueDate) ?? []), entry]));
  grouped.forEach(items => items.sort((left, right) => left.title.localeCompare(right.title)));
  return grouped;
}
