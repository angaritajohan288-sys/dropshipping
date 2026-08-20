import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getCompletedTaskKeysForUser: vi.fn(),
  setTaskProgressForUser: vi.fn(),
  getPlanStartDateForUser: vi.fn(),
  setPlanStartDateForUser: vi.fn(),
  getTaskWorkspaceForUser: vi.fn(),
  saveTaskNoteForUser: vi.fn(),
  getTaskAttachmentForUser: vi.fn(),
  getBusinessMetricsForUser: vi.fn(),
  saveBusinessMetricsForUser: vi.fn(),
}));

const storageMocks = vi.hoisted(() => ({ storageGetSignedUrl: vi.fn() }));

vi.mock("./db", () => dbMocks);
vi.mock("./storage", () => storageMocks);

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
    dbMocks.getPlanStartDateForUser.mockResolvedValue("2026-08-03");
    dbMocks.setPlanStartDateForUser.mockResolvedValue(undefined);
    dbMocks.getTaskWorkspaceForUser.mockResolvedValue({ note: { content: "Validar proveedor", updatedAt: new Date() }, attachments: [] });
    dbMocks.saveTaskNoteForUser.mockResolvedValue("Validar proveedor");
    dbMocks.getTaskAttachmentForUser.mockResolvedValue({ id: 9, storageKey: "private/object.pdf", fileName: "brief.pdf" });
    dbMocks.getBusinessMetricsForUser.mockResolvedValue(null);
    dbMocks.saveBusinessMetricsForUser.mockResolvedValue(undefined);
    storageMocks.storageGetSignedUrl.mockResolvedValue("https://signed.example/object.pdf");
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

  it("persists calendar, notes and metrics using only the authenticated user id", async () => {
    const caller = appRouter.createCaller(createContext(42));
    await caller.tracker.setStartDate({ startDate: "2026-08-03" });
    await caller.tracker.saveTaskNote({ taskKey: "products-01", content: "Validar proveedor" });
    await caller.tracker.saveMetrics({ revenueCents: 50000, productCostCents: 18000, adSpendCents: 12000, orders: 10, currency: "USD" });

    expect(dbMocks.setPlanStartDateForUser).toHaveBeenCalledWith(42, "2026-08-03");
    expect(dbMocks.saveTaskNoteForUser).toHaveBeenCalledWith(42, "products-01", "Validar proveedor");
    expect(dbMocks.saveBusinessMetricsForUser).toHaveBeenCalledWith({ userId: 42, revenueCents: 50000, productCostCents: 18000, adSpendCents: 12000, orders: 10, currency: "USD" });
  });

  it("emits a signed attachment URL only after a user-scoped lookup", async () => {
    const caller = appRouter.createCaller(createContext(42));
    const result = await caller.tracker.attachmentDownloadUrl({ attachmentId: 9 });

    expect(dbMocks.getTaskAttachmentForUser).toHaveBeenCalledWith(42, 9);
    expect(storageMocks.storageGetSignedUrl).toHaveBeenCalledWith("private/object.pdf");
    expect(result).toEqual({ url: "https://signed.example/object.pdf", fileName: "brief.pdf" });
  });
});
