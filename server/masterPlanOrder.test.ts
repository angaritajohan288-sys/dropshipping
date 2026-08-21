import { describe, expect, it } from "vitest";
import { PHASES } from "../shared/staticPlan";

describe("mapa maestro de lanzamiento", () => {
  it("mantiene las tareas P0 antes de P1, P2 y P3 en cada fase", () => {
    expect(PHASES).toHaveLength(10);
    for (const phase of PHASES) {
      const ranks = phase.tasks.map(task => Number(task.title.match(/^P(\d)/)?.[1] ?? "2"));
      expect(ranks).toEqual([...ranks].sort((first, second) => first - second));
      expect(phase.tasks.at(-1)?.title).toContain("Cierre de fase");
    }
  });
});
