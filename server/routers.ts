import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  clearPlanStartDateForUser,
  clearTaskDeadlineForUser,
  deleteMonthlyMetricForUser,
  deleteTaskAttachmentForUser,
  getBusinessMetricsForUser,
  getCompletedTaskKeysForUser,
  getMonthlyMetricsForUser,
  getPlanStartDateForUser,
  getTaskAttachmentForUser,
  getTaskDeadlinesForUser,
  getTaskWorkspaceForUser,
  importMonthlyMetricsForUser,
  saveBusinessMetricsForUser,
  saveTaskNoteForUser,
  setPlanStartDateForUser,
  setTaskDeadlineForUser,
  setTaskProgressForUser,
} from "./db";
import { KNOWN_TASK_KEYS, PHASES, PLAN_WEEKS } from "./planData";
import { storageGetSignedUrl } from "./storage";

const taskKeySchema = z.string().min(1).max(96).refine(value => KNOWN_TASK_KEYS.has(value), {
  message: "La tarea indicada no pertenece al plan.",
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe usar el formato AAAA-MM-DD.").refine(value => {
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "La fecha de inicio no es válida.");

const moneySchema = z.number().int().min(0).max(2_000_000_000);
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "El mes debe usar el formato AAAA-MM.");
const currencySchema = z.enum(["USD", "EUR", "MXN", "COP"]);
const monthlyMetricSchema = z.object({
  monthKey: monthSchema,
  revenueCents: moneySchema,
  productCostCents: moneySchema,
  adSpendCents: moneySchema,
  orders: z.number().int().min(0).max(10_000_000),
  currency: currencySchema,
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tracker: router({
    plan: publicProcedure.query(() => ({ phases: PHASES, weeks: PLAN_WEEKS })),
    progress: protectedProcedure.query(async ({ ctx }) => ({
      completedTaskKeys: await getCompletedTaskKeysForUser(ctx.user.id),
    })),
    setTaskStatus: protectedProcedure
      .input(z.object({ taskKey: taskKeySchema, isCompleted: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await setTaskProgressForUser(ctx.user.id, input.taskKey, input.isCompleted);
        return { taskKey: input.taskKey, isCompleted: input.isCompleted };
      }),
    deadlines: protectedProcedure.query(({ ctx }) => getTaskDeadlinesForUser(ctx.user.id)),
    setTaskDeadline: protectedProcedure
      .input(z.object({ taskKey: taskKeySchema, dueDate: dateSchema }))
      .mutation(async ({ ctx, input }) => {
        await setTaskDeadlineForUser(ctx.user.id, input.taskKey, input.dueDate);
        return input;
      }),
    clearTaskDeadline: protectedProcedure
      .input(z.object({ taskKey: taskKeySchema }))
      .mutation(async ({ ctx, input }) => {
        await clearTaskDeadlineForUser(ctx.user.id, input.taskKey);
        return { taskKey: input.taskKey, dueDate: null };
      }),
    calendar: protectedProcedure.query(async ({ ctx }) => ({
      startDate: await getPlanStartDateForUser(ctx.user.id),
    })),
    setStartDate: protectedProcedure
      .input(z.object({ startDate: dateSchema }))
      .mutation(async ({ ctx, input }) => {
        await setPlanStartDateForUser(ctx.user.id, input.startDate);
        return { startDate: input.startDate };
      }),
    clearStartDate: protectedProcedure.mutation(async ({ ctx }) => {
      await clearPlanStartDateForUser(ctx.user.id);
      return { startDate: null };
    }),
    taskWorkspace: protectedProcedure
      .input(z.object({ taskKey: taskKeySchema }))
      .query(({ ctx, input }) => getTaskWorkspaceForUser(ctx.user.id, input.taskKey)),
    saveTaskNote: protectedProcedure
      .input(z.object({ taskKey: taskKeySchema, content: z.string().max(5_000) }))
      .mutation(async ({ ctx, input }) => ({
        content: await saveTaskNoteForUser(ctx.user.id, input.taskKey, input.content),
      })),
    attachmentDownloadUrl: protectedProcedure
      .input(z.object({ attachmentId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const attachment = await getTaskAttachmentForUser(ctx.user.id, input.attachmentId);
        if (!attachment) throw new TRPCError({ code: "NOT_FOUND", message: "Adjunto no encontrado." });
        return { url: await storageGetSignedUrl(attachment.storageKey), fileName: attachment.fileName };
      }),
    deleteAttachment: protectedProcedure
      .input(z.object({ attachmentId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await deleteTaskAttachmentForUser(ctx.user.id, input.attachmentId);
        return { success: true } as const;
      }),
    metrics: protectedProcedure.query(async ({ ctx }) => {
      const metrics = await getBusinessMetricsForUser(ctx.user.id);
      return metrics ?? { revenueCents: 0, productCostCents: 0, adSpendCents: 0, orders: 0, currency: "USD" };
    }),
    saveMetrics: protectedProcedure
      .input(z.object({
        revenueCents: moneySchema,
        productCostCents: moneySchema,
        adSpendCents: moneySchema,
        orders: z.number().int().min(0).max(10_000_000),
        currency: z.enum(["USD", "EUR", "MXN", "COP"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await saveBusinessMetricsForUser({ userId: ctx.user.id, ...input });
        return input;
      }),
    monthlyMetrics: protectedProcedure.query(({ ctx }) => getMonthlyMetricsForUser(ctx.user.id)),
    importMonthlyMetrics: protectedProcedure
      .input(z.object({ rows: z.array(monthlyMetricSchema).min(1).max(120) }))
      .mutation(async ({ ctx, input }) => ({ imported: await importMonthlyMetricsForUser(ctx.user.id, input.rows) })),
    deleteMonthlyMetric: protectedProcedure
      .input(z.object({ monthKey: monthSchema, currency: currencySchema }))
      .mutation(async ({ ctx, input }) => {
        await deleteMonthlyMetricForUser(ctx.user.id, input.monthKey, input.currency);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
