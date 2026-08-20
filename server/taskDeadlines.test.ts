import { describe, expect, it } from "vitest";
import { isTaskDueSoon, isTaskDueToday, isTaskOverdue } from "../shared/taskDeadlines";

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

  it("marca recordatorios durante una ventana de tres días, sin incluir tareas terminadas o vencidas", () => {
    expect(isTaskDueSoon("2026-08-20", false, today)).toBe(true);
    expect(isTaskDueSoon("2026-08-23", false, today)).toBe(true);
    expect(isTaskDueSoon("2026-08-24", false, today)).toBe(false);
    expect(isTaskDueSoon("2026-08-19", false, today)).toBe(false);
    expect(isTaskDueSoon("2026-08-21", true, today)).toBe(false);
  });

  it("respeta la anticipación configurable sin modificar las reglas de vencimiento", () => {
    expect(isTaskDueSoon("2026-08-24", false, today, 3)).toBe(false);
    expect(isTaskDueSoon("2026-08-24", false, today, 4)).toBe(true);
    expect(isTaskOverdue("2026-08-19", false, today)).toBe(true);
  });
});
