export type OperationalPhase = {
  id: string;
  tasks: Array<{ id: string }>;
};

export function getOperationalState(phases: OperationalPhase[], completedTaskKeys: Iterable<string>) {
  const completed = new Set(completedTaskKeys);
  const firstOpenPhaseIndex = phases.findIndex(phase => phase.tasks.some(task => !completed.has(task.id)));
  const phaseIndex = firstOpenPhaseIndex === -1 ? Math.max(0, phases.length - 1) : firstOpenPhaseIndex;

  return {
    phaseIndex,
    weekNumber: Math.max(1, Math.min(4, phaseIndex + 1)),
    isComplete: phases.length > 0 && firstOpenPhaseIndex === -1,
  };
}

function localDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function midnight(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function getCalendarWeek(startDate: string | null, referenceDate = new Date()) {
  if (!startDate) return null;
  const start = localDate(startDate);
  if (Number.isNaN(start.getTime())) return null;
  const elapsedDays = Math.floor((midnight(referenceDate).getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.min(4, Math.floor(elapsedDays / 7) + 1));
}

export function getWeekRange(startDate: string | null, weekNumber: number) {
  if (!startDate || weekNumber < 1 || weekNumber > 4) return null;
  const start = localDate(startDate);
  if (Number.isNaN(start.getTime())) return null;
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}
