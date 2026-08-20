import { describe, expect, it } from "vitest";
import { dateKeyFromDate, groupDeadlineEntries } from "../shared/deadlineCalendar";

describe("deadline calendar", () => {
  it("agrupa tareas por fecha y conserva una lista ordenada de cada día", () => {
    const grouped = groupDeadlineEntries([
      { taskKey: "b", dueDate: "2026-08-23", title: "Borrar", phaseName: "Marketing", isCompleted: false },
      { taskKey: "a", dueDate: "2026-08-23", title: "Analizar", phaseName: "Marketing", isCompleted: false },
    ]);
    expect(grouped.get("2026-08-23")?.map(entry => entry.title)).toEqual(["Analizar", "Borrar"]);
  });

  it("crea claves locales consistentes para la interacción de días", () => {
    expect(dateKeyFromDate(new Date(2026, 7, 23))).toBe("2026-08-23");
  });
});
