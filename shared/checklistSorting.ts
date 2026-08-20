export type DeadlineSortableTask = { id: string };

/** Devuelve una vista estable: las tareas sin fecha permanecen al final en el orden canónico. */
export function sortTasksByDeadline<T extends DeadlineSortableTask>(tasks: T[], deadlineByTask: Map<string, string>) {
  return tasks
    .map((task, index) => ({ task, index, dueDate: deadlineByTask.get(task.id) }))
    .sort((left, right) => {
      if (!left.dueDate && !right.dueDate) return left.index - right.index;
      if (!left.dueDate) return 1;
      if (!right.dueDate) return -1;
      return left.dueDate.localeCompare(right.dueDate) || left.index - right.index;
    })
    .map(item => item.task);
}
