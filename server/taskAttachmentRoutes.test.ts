import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  createTaskAttachmentForUser: vi.fn(),
  storagePut: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./db", () => ({ createTaskAttachmentForUser: mocks.createTaskAttachmentForUser }));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));

import { handleTaskAttachmentUpload } from "./taskAttachmentRoutes";

function responseSpy() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { response: { status } as unknown as Response, status, json };
}

describe("handleTaskAttachmentUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticateRequest.mockResolvedValue({ id: 42 });
    mocks.storagePut.mockResolvedValue({ key: "task-attachments/42/products-01/brief_abcd.pdf" });
    mocks.createTaskAttachmentForUser.mockResolvedValue(7);
  });

  it("exige una sesión autenticada antes de procesar archivos", async () => {
    mocks.authenticateRequest.mockRejectedValue(new Error("Invalid session"));
    const { response, status } = responseSpy();
    await handleTaskAttachmentUpload({ body: {} } as Request, response);
    expect(status).toHaveBeenCalledWith(401);
    expect(mocks.storagePut).not.toHaveBeenCalled();
  });

  it("rechaza tipos no permitidos y adjuntos que superan el límite", async () => {
    const invalid = responseSpy();
    await handleTaskAttachmentUpload({ body: { taskKey: "products-01", fileName: "script.exe", mimeType: "application/x-msdownload", base64: "YQ==" } } as Request, invalid.response);
    expect(invalid.status).toHaveBeenCalledWith(400);
    expect(mocks.storagePut).not.toHaveBeenCalled();

    const tooLarge = responseSpy();
    await handleTaskAttachmentUpload({ body: { taskKey: "products-01", fileName: "large.pdf", mimeType: "application/pdf", base64: Buffer.alloc(6 * 1024 * 1024 + 1).toString("base64") } } as Request, tooLarge.response);
    expect(tooLarge.status).toHaveBeenCalledWith(400);
  });

  it("almacena los bytes fuera de la base de datos y persiste solo metadatos privados", async () => {
    const { response, status, json } = responseSpy();
    await handleTaskAttachmentUpload({ body: { taskKey: "products-01", fileName: "brief final.pdf", mimeType: "application/pdf", base64: Buffer.from("nota privada").toString("base64") } } as Request, response);

    expect(mocks.storagePut).toHaveBeenCalledWith("task-attachments/42/products-01/brief final.pdf", expect.any(Buffer), "application/pdf");
    expect(mocks.createTaskAttachmentForUser).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, taskKey: "products-01", fileName: "brief final.pdf", storageKey: "task-attachments/42/products-01/brief_abcd.pdf" }));
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ attachment: expect.objectContaining({ id: 7 }) }));
  });
});
