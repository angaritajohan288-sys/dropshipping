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
