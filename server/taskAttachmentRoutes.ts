import type { Express, Request, Response } from "express";
import { createTaskAttachmentForUser } from "./db";
import { KNOWN_TASK_KEYS } from "./planData";
import { sdk } from "./_core/sdk";
import { storagePut } from "./storage";

const MAX_FILE_BYTES = 6 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function safeName(value: unknown) {
  if (typeof value !== "string") return "adjunto";
  const cleaned = value.replace(/[^a-zA-Z0-9._() -]/g, "_").trim().slice(0, 180);
  return cleaned || "adjunto";
}

export async function handleTaskAttachmentUpload(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    const { taskKey, fileName, mimeType, base64 } = req.body ?? {};

    if (typeof taskKey !== "string" || !KNOWN_TASK_KEYS.has(taskKey)) {
      return res.status(400).json({ error: "La tarea indicada no pertenece al plan." });
    }
    if (typeof mimeType !== "string" || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.status(400).json({ error: "El tipo de archivo no está permitido." });
    }
    if (typeof base64 !== "string" || base64.length === 0) {
      return res.status(400).json({ error: "No se recibió el contenido del archivo." });
    }

    const bytes = Buffer.from(base64, "base64");
    if (!bytes.length || bytes.length > MAX_FILE_BYTES) {
      return res.status(400).json({ error: "El adjunto debe pesar entre 1 byte y 6 MB." });
    }

    const normalizedName = safeName(fileName);
    const stored = await storagePut(`task-attachments/${user.id}/${taskKey}/${normalizedName}`, bytes, mimeType);
    const id = await createTaskAttachmentForUser({
      userId: user.id,
      taskKey,
      storageKey: stored.key,
      fileName: normalizedName,
      mimeType,
      sizeBytes: bytes.length,
    });

    return res.status(201).json({
      attachment: { id, fileName: normalizedName, mimeType, sizeBytes: bytes.length, createdAt: new Date() },
    });
  } catch (error) {
    console.error("[Task attachments] Upload failed:", error);
    return res.status(401).json({ error: "No fue posible cargar el adjunto. Verifica tu sesión e inténtalo de nuevo." });
  }
}

export function registerTaskAttachmentRoutes(app: Express) {
  app.post("/api/task-attachments", handleTaskAttachmentUpload);
}
