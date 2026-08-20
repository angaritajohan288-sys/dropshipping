import { describe, expect, it } from "vitest";
import { getCalendarWeek, getOperationalState, getWeekRange } from "../shared/trackerProgress";

const phases = [
  { id: "products", tasks: [{ id: "products-01" }] },
  { id: "store", tasks: [{ id: "store-01" }] },
  { id: "marketing", tasks: [{ id: "marketing-01" }] },
  { id: "operations", tasks: [{ id: "operations-01" }] },
];

describe("getOperationalState", () => {
  it("selecciona la primera fase que conserva trabajo pendiente", () => {
    expect(getOperationalState(phases, ["products-01", "store-01"])).toMatchObject({ phaseIndex: 2, weekNumber: 3, isComplete: false });
  });

  it("mantiene la semana cuatro cuando toda la operación está completada", () => {
    const completed = phases.flatMap(phase => phase.tasks.map(task => task.id));
    expect(getOperationalState(phases, completed)).toMatchObject({ phaseIndex: 3, weekNumber: 4, isComplete: true });
  });
});

describe("cronograma real", () => {
  it("ubica la fecha de referencia dentro de la semana correcta desde el inicio", () => {
    expect(getCalendarWeek("2026-08-03", new Date(2026, 7, 17))).toBe(3);
    expect(getCalendarWeek("2026-08-03", new Date(2026, 7, 1))).toBe(1);
    expect(getCalendarWeek("2026-08-03", new Date(2026, 8, 15))).toBe(4);
  });

  it("calcula un rango de siete días por cada semana del plan", () => {
    const range = getWeekRange("2026-08-03", 2);
    expect(range?.start).toEqual(new Date(2026, 7, 10));
    expect(range?.end).toEqual(new Date(2026, 7, 16));
  });
});
