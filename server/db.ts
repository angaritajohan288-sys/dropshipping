import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  taskAttachments,
  taskNotes,
  taskProgress,
  userBusinessMetrics,
  userMonthlyMetrics,
  userPlanSettings,
  userReminderSettings,
  userTaskDeadlines,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCompletedTaskKeysForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ taskKey: taskProgress.taskKey })
    .from(taskProgress)
    .where(and(eq(taskProgress.userId, userId), eq(taskProgress.isCompleted, true)));

  return result.map(item => item.taskKey);
}

export async function setTaskProgressForUser(userId: number, taskKey: string, isCompleted: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const completedAt = isCompleted ? new Date() : null;
  await db
    .insert(taskProgress)
    .values({ userId, taskKey, isCompleted, completedAt })
    .onDuplicateKeyUpdate({ set: { isCompleted, completedAt } });
}

export async function getTaskDeadlinesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ taskKey: userTaskDeadlines.taskKey, dueDate: userTaskDeadlines.dueDate })
    .from(userTaskDeadlines)
    .where(eq(userTaskDeadlines.userId, userId));
}

export async function setTaskDeadlineForUser(userId: number, taskKey: string, dueDate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userTaskDeadlines).values({ userId, taskKey, dueDate }).onDuplicateKeyUpdate({ set: { dueDate } });
}

export async function clearTaskDeadlineForUser(userId: number, taskKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userTaskDeadlines).where(and(eq(userTaskDeadlines.userId, userId), eq(userTaskDeadlines.taskKey, taskKey)));
}

export async function getReminderLeadDaysForUser(userId: number) {
  const db = await getDb();
  if (!db) return 3;
  const result = await db.select({ leadDays: userReminderSettings.leadDays }).from(userReminderSettings).where(eq(userReminderSettings.userId, userId)).limit(1);
  return result[0]?.leadDays ?? 3;
}

export async function setReminderLeadDaysForUser(userId: number, leadDays: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userReminderSettings).values({ userId, leadDays }).onDuplicateKeyUpdate({ set: { leadDays } });
}

export async function getPlanStartDateForUser(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userPlanSettings).where(eq(userPlanSettings.userId, userId)).limit(1);
  return result[0]?.startDate ?? null;
}

export async function setPlanStartDateForUser(userId: number, startDate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userPlanSettings).values({ userId, startDate }).onDuplicateKeyUpdate({ set: { startDate } });
}

export async function clearPlanStartDateForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userPlanSettings).where(eq(userPlanSettings.userId, userId));
}

export async function getTaskWorkspaceForUser(userId: number, taskKey: string) {
  const db = await getDb();
  if (!db) return { note: null, attachments: [], deadline: null };

  const [note] = await db
    .select({ content: taskNotes.content, updatedAt: taskNotes.updatedAt })
    .from(taskNotes)
    .where(and(eq(taskNotes.userId, userId), eq(taskNotes.taskKey, taskKey)))
    .limit(1);
  const attachments = await db
    .select({
      id: taskAttachments.id,
      fileName: taskAttachments.fileName,
      mimeType: taskAttachments.mimeType,
      sizeBytes: taskAttachments.sizeBytes,
      createdAt: taskAttachments.createdAt,
    })
    .from(taskAttachments)
    .where(and(eq(taskAttachments.userId, userId), eq(taskAttachments.taskKey, taskKey)))
    .orderBy(desc(taskAttachments.createdAt));

  const [deadline] = await db
    .select({ dueDate: userTaskDeadlines.dueDate })
    .from(userTaskDeadlines)
    .where(and(eq(userTaskDeadlines.userId, userId), eq(userTaskDeadlines.taskKey, taskKey)))
    .limit(1);

  return { note: note ?? null, attachments, deadline: deadline?.dueDate ?? null };
}

export async function saveTaskNoteForUser(userId: number, taskKey: string, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const normalized = content.trim();
  if (!normalized) {
    await db.delete(taskNotes).where(and(eq(taskNotes.userId, userId), eq(taskNotes.taskKey, taskKey)));
    return null;
  }
  await db.insert(taskNotes).values({ userId, taskKey, content: normalized }).onDuplicateKeyUpdate({ set: { content: normalized } });
  return normalized;
}

export async function createTaskAttachmentForUser(input: {
  userId: number;
  taskKey: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(taskAttachments).values(input);
  return Number(result[0].insertId);
}

export async function getTaskAttachmentForUser(userId: number, attachmentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(taskAttachments)
    .where(and(eq(taskAttachments.userId, userId), eq(taskAttachments.id, attachmentId)))
    .limit(1);
  return result[0] ?? null;
}

export async function deleteTaskAttachmentForUser(userId: number, attachmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(taskAttachments)
    .where(and(eq(taskAttachments.userId, userId), eq(taskAttachments.id, attachmentId)));
}

export async function getBusinessMetricsForUser(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userBusinessMetrics).where(eq(userBusinessMetrics.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function saveBusinessMetricsForUser(input: {
  userId: number;
  revenueCents: number;
  productCostCents: number;
  adSpendCents: number;
  orders: number;
  currency: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { userId, ...values } = input;
  await db.insert(userBusinessMetrics).values({ userId, ...values }).onDuplicateKeyUpdate({ set: values });
}

export type MonthlyMetricInput = {
  monthKey: string;
  revenueCents: number;
  productCostCents: number;
  adSpendCents: number;
  orders: number;
  currency: string;
};

export async function getMonthlyMetricsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userMonthlyMetrics).where(eq(userMonthlyMetrics.userId, userId)).orderBy(desc(userMonthlyMetrics.monthKey));
}

export async function importMonthlyMetricsForUser(userId: number, rows: MonthlyMetricInput[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const row of rows) {
    const { monthKey, currency, ...values } = row;
    await db
      .insert(userMonthlyMetrics)
      .values({ userId, monthKey, currency, ...values, importedAt: new Date() })
      .onDuplicateKeyUpdate({ set: { ...values, importedAt: new Date() } });
  }
  return rows.length;
}

export async function deleteMonthlyMetricForUser(userId: number, monthKey: string, currency: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userMonthlyMetrics).where(and(eq(userMonthlyMetrics.userId, userId), eq(userMonthlyMetrics.monthKey, monthKey), eq(userMonthlyMetrics.currency, currency)));
}
