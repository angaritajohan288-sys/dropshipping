import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Estado de cada tarea, aislado mediante el identificador interno del usuario autenticado. */
export const taskProgress = mysqlTable(
  "taskProgress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    taskKey: varchar("taskKey", { length: 96 }).notNull(),
    isCompleted: boolean("isCompleted").notNull().default(false),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  },
  table => [uniqueIndex("task_progress_user_task_unique").on(table.userId, table.taskKey)],
);

export type TaskProgress = typeof taskProgress.$inferSelect;
export type InsertTaskProgress = typeof taskProgress.$inferInsert;

/** Fecha límite elegida por el usuario para una tarea canónica. */
export const userTaskDeadlines = mysqlTable(
  "userTaskDeadlines",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    taskKey: varchar("taskKey", { length: 96 }).notNull(),
    dueDate: varchar("dueDate", { length: 10 }).notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  },
  table => [uniqueIndex("task_deadline_user_task_unique").on(table.userId, table.taskKey)],
);

export type UserTaskDeadline = typeof userTaskDeadlines.$inferSelect;
export type InsertUserTaskDeadline = typeof userTaskDeadlines.$inferInsert;

/** Configuración de calendario privada. La fecha usa formato YYYY-MM-DD para conservar el día elegido por el usuario. */
export const userPlanSettings = mysqlTable(
  "userPlanSettings",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    startDate: varchar("startDate", { length: 10 }).notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  },
  table => [uniqueIndex("plan_settings_user_unique").on(table.userId)],
);

export type UserPlanSettings = typeof userPlanSettings.$inferSelect;
export type InsertUserPlanSettings = typeof userPlanSettings.$inferInsert;

/** Una nota editable por combinación de usuario y tarea canónica. */
export const taskNotes = mysqlTable(
  "taskNotes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    taskKey: varchar("taskKey", { length: 96 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  },
  table => [uniqueIndex("task_note_user_task_unique").on(table.userId, table.taskKey)],
);

export type TaskNote = typeof taskNotes.$inferSelect;
export type InsertTaskNote = typeof taskNotes.$inferInsert;

/** Metadatos de adjuntos; los bytes se almacenan en S3 y nunca en la base de datos. */
export const taskAttachments = mysqlTable("taskAttachments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  taskKey: varchar("taskKey", { length: 96 }).notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type TaskAttachment = typeof taskAttachments.$inferSelect;
export type InsertTaskAttachment = typeof taskAttachments.$inferInsert;

/** Snapshot manual de negocio; los montos se guardan en centavos para evitar errores de punto flotante. */
export const userBusinessMetrics = mysqlTable(
  "userBusinessMetrics",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    revenueCents: int("revenueCents").notNull().default(0),
    productCostCents: int("productCostCents").notNull().default(0),
    adSpendCents: int("adSpendCents").notNull().default(0),
    orders: int("orders").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  },
  table => [uniqueIndex("business_metrics_user_unique").on(table.userId)],
);

export type UserBusinessMetrics = typeof userBusinessMetrics.$inferSelect;
export type InsertUserBusinessMetrics = typeof userBusinessMetrics.$inferInsert;

/** Serie mensual privada; cada registro representa un mes y moneda concretos importados o confirmados por el usuario. */
export const userMonthlyMetrics = mysqlTable(
  "userMonthlyMetrics",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    monthKey: varchar("monthKey", { length: 7 }).notNull(),
    revenueCents: int("revenueCents").notNull().default(0),
    productCostCents: int("productCostCents").notNull().default(0),
    adSpendCents: int("adSpendCents").notNull().default(0),
    orders: int("orders").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    importedAt: timestamp("importedAt").notNull().defaultNow(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  },
  table => [uniqueIndex("monthly_metrics_user_month_currency_unique").on(table.userId, table.monthKey, table.currency)],
);

export type UserMonthlyMetric = typeof userMonthlyMetrics.$inferSelect;
export type InsertUserMonthlyMetric = typeof userMonthlyMetrics.$inferInsert;
