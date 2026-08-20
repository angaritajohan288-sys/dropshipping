import { describe, expect, it } from "vitest";
import { getOperationalState } from "../shared/trackerProgress";

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
