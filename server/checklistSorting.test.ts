import { describe, expect, it } from "vitest";
import { sortTasksByDeadline } from "../shared/checklistSorting";

describe("sortTasksByDeadline", () => {
  it("ordena fechas ascendentemente y conserva al final el orden canónico de tareas sin fecha", () => {
    const tasks = [{ id: "one" }, { id: "two" }, { id: "three" }, { id: "four" }];
    const deadlines = new Map([ ["three", "2026-08-21"], ["one", "2026-08-20"] ]);

    expect(sortTasksByDeadline(tasks, deadlines).map(task => task.id)).toEqual(["one", "three", "two", "four"]);
  });
});
