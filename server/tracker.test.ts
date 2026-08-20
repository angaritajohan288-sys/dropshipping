import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getCompletedTaskKeysForUser: vi.fn(),
  setTaskProgressForUser: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(userId: number | null): TrpcContext {
  return {
    user: userId === null ? null : {
      id: userId,
      openId: `operator-${userId}`,
      name: `Operator ${userId}`,
      email: `operator-${userId}@example.com`,
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("tracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getCompletedTaskKeysForUser.mockResolvedValue(["products-01"]);
    dbMocks.setTaskProgressForUser.mockResolvedValue(undefined);
  });

  it("exposes exactly the four agreed phases and twenty executable tasks", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const plan = await caller.tracker.plan();

    expect(plan.phases.map(phase => phase.name)).toEqual([
      "Selección de Productos",
      "Construcción de Tienda",
      "Marketing",
      "Operaciones",
    ]);
    expect(plan.phases.flatMap(phase => phase.tasks)).toHaveLength(20);
    expect(plan.weeks).toHaveLength(4);
  });

  it("does not expose user progress without authentication", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.tracker.progress()).rejects.toMatchObject<Partial<TRPCError>>({ code: "UNAUTHORIZED" });
    expect(dbMocks.getCompletedTaskKeysForUser).not.toHaveBeenCalled();
  });

  it("reads and writes progress only with the authenticated user id", async () => {
    const caller = appRouter.createCaller(createContext(42));
    const progress = await caller.tracker.progress();
    await caller.tracker.setTaskStatus({ taskKey: "products-02", isCompleted: true });

    expect(progress).toEqual({ completedTaskKeys: ["products-01"] });
    expect(dbMocks.getCompletedTaskKeysForUser).toHaveBeenCalledWith(42);
    expect(dbMocks.setTaskProgressForUser).toHaveBeenCalledWith(42, "products-02", true);
  });

  it("rejects task keys outside the canonical plan before attempting a write", async () => {
    const caller = appRouter.createCaller(createContext(42));
    await expect(caller.tracker.setTaskStatus({ taskKey: "other-user-task", isCompleted: true })).rejects.toMatchObject<Partial<TRPCError>>({ code: "BAD_REQUEST" });
    expect(dbMocks.setTaskProgressForUser).not.toHaveBeenCalled();
  });
});
