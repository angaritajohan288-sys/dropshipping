import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getCompletedTaskKeysForUser, setTaskProgressForUser } from "./db";
import { KNOWN_TASK_KEYS, PHASES, PLAN_WEEKS } from "./planData";

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
      .input(z.object({ taskKey: z.string().min(1).max(96), isCompleted: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (!KNOWN_TASK_KEYS.has(input.taskKey)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "La tarea indicada no pertenece al plan." });
        }

        await setTaskProgressForUser(ctx.user.id, input.taskKey, input.isCompleted);
        return { taskKey: input.taskKey, isCompleted: input.isCompleted };
      }),
  }),
});

export type AppRouter = typeof appRouter;
