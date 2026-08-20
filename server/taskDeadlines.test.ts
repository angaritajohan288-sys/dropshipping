import { describe, expect, it } from "vitest";
import { isTaskDueToday, isTaskOverdue } from "../shared/taskDeadlines";

describe("task deadline status", () => {
  const today = new Date(2026, 7, 20, 10, 0, 0);

  it("destaca solo tareas incompletas cuya fecha ya pasó", () => {
    expect(isTaskOverdue("2026-08-19", false, today)).toBe(true);
    expect(isTaskOverdue("2026-08-19", true, today)).toBe(false);
    expect(isTaskOverdue("2026-08-21", false, today)).toBe(false);
  });

  it("reconoce las tareas que vencen hoy sin marcarlas como vencidas", () => {
    expect(isTaskDueToday("2026-08-20", false, today)).toBe(true);
    expect(isTaskOverdue("2026-08-20", false, today)).toBe(false);
  });
});
