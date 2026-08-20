import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Download, FileText, Loader2, Paperclip, Save, Upload, X } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type TaskWorkspaceProps = {
  taskKey: string;
  taskTitle: string;
  onClose: () => void;
};

function getSessionHeaders(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem("manus-cookie");
    if (raw) {
      const tokenPair = raw.split(";").find(item => item.trim().startsWith("app_session_id="));
      const token = tokenPair?.trim().slice("app_session_id=".length);
      if (token) return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Las cookies de sesión siguen siendo suficientes cuando sessionStorage no está disponible.
  }
  return {};
}

function formatBytes(size: number) {
  if (size < 1_024) return `${size} B`;
  if (size < 1_024 * 1_024) return `${(size / 1_024).toFixed(1)} KB`;
  return `${(size / (1_024 * 1_024)).toFixed(1)} MB`;
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result.split(",")[1] : null;
      if (result) resolve(result);
      else reject(new Error("No fue posible leer el adjunto."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("No fue posible leer el adjunto."));
    reader.readAsDataURL(file);
  });
}

export default function TaskWorkspace({ taskKey, taskTitle, onClose }: TaskWorkspaceProps) {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const workspaceQuery = trpc.tracker.taskWorkspace.useQuery({ taskKey });
  const saveNote = trpc.tracker.saveTaskNote.useMutation({
    onSuccess: () => {
      utils.tracker.taskWorkspace.invalidate({ taskKey });
      toast.success("Nota guardada en tu espacio privado.");
    },
    onError: () => toast.error("No se pudo guardar la nota."),
  });

  useEffect(() => {
    setNote(workspaceQuery.data?.note?.content ?? "");
  }, [workspaceQuery.data?.note?.content, taskKey]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      toast.error("El adjunto no puede superar 6 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await readFileAsBase64(file);
      const response = await fetch("/api/task-attachments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getSessionHeaders() },
        body: JSON.stringify({ taskKey, fileName: file.name, mimeType: file.type || "text/plain", base64 }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "No se pudo cargar el adjunto.");
      await utils.tracker.taskWorkspace.invalidate({ taskKey });
      toast.success("Adjunto cargado de forma privada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el adjunto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachmentId: number) => {
    try {
      const result = await utils.tracker.attachmentDownloadUrl.fetch({ attachmentId });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("No se pudo abrir el adjunto.");
    }
  };

  return (
    <section className="border-t border-cyan-200/15 bg-black/20 p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/8 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="hud-label">Espacio privado de tarea</p>
          <h4 className="mt-1 text-base font-black uppercase tracking-tight text-white">{taskTitle}</h4>
        </div>
        <Button variant="outline" onClick={onClose} className="w-fit rounded-none border-slate-500/40 text-slate-300 hover:bg-white/5 hover:text-white"><X className="mr-2 size-4" />Cerrar</Button>
      </div>

      {workspaceQuery.isLoading ? (
        <div className="grid min-h-40 place-items-center"><Loader2 className="size-5 animate-spin text-cyan-200" /></div>
      ) : workspaceQuery.isError ? (
        <div className="mt-5 border border-rose-300/30 bg-rose-400/5 p-4 text-sm text-rose-100">No fue posible recuperar tus notas y adjuntos. <button onClick={() => workspaceQuery.refetch()} className="ml-2 font-bold underline">Reintentar</button></div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <label htmlFor={`note-${taskKey}`} className="hud-label">Notas personales</label>
            <textarea id={`note-${taskKey}`} value={note} onChange={event => setNote(event.target.value)} maxLength={5000} placeholder="Escribe decisiones, enlaces, hallazgos o próximos pasos..." className="mt-2 min-h-36 w-full resize-y border border-cyan-200/20 bg-black/30 p-3 text-sm leading-6 text-slate-100 placeholder:text-slate-600 focus:border-cyan-200/70 focus:outline-none" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] text-slate-500">{note.length}/5000 caracteres</span><Button onClick={() => saveNote.mutate({ taskKey, content: note })} disabled={saveNote.isPending} className="neon-button rounded-none px-4 text-xs font-bold uppercase tracking-[0.12em]"><Save className="mr-2 size-3.5" />{saveNote.isPending ? "Guardando" : "Guardar nota"}</Button></div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3"><p className="hud-label">Adjuntos</p><input ref={fileInputRef} onChange={handleUpload} type="file" className="hidden" accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,.docx,.xlsx" /><Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="rounded-none border-fuchsia-300/40 text-fuchsia-100 hover:bg-fuchsia-400/10"><Upload className="mr-2 size-3.5" />{isUploading ? "Cargando" : "Añadir"}</Button></div>
            <p className="mt-2 text-xs leading-5 text-slate-500">PDF, imagen, TXT, DOCX o XLSX. Máximo 6 MB. Los enlaces se emiten tras comprobar tu sesión.</p>
            <div className="mt-4 space-y-2">{workspaceQuery.data?.attachments.length ? workspaceQuery.data.attachments.map(attachment => <div key={attachment.id} className="flex items-center gap-3 border border-white/8 bg-white/[0.025] p-3"><span className="grid size-8 shrink-0 place-items-center border border-cyan-300/25 bg-cyan-300/5 text-cyan-100"><FileText className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{attachment.fileName}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">{formatBytes(attachment.sizeBytes)} · {attachment.mimeType.split("/").pop()}</p></div><button onClick={() => handleDownload(attachment.id)} className="grid size-8 place-items-center border border-cyan-300/25 text-cyan-100 transition hover:bg-cyan-300/10" aria-label={`Abrir ${attachment.fileName}`}><Download className="size-4" /></button></div>) : <div className="border border-dashed border-slate-600/50 p-5 text-center"><Paperclip className="mx-auto size-4 text-slate-600" /><p className="mt-2 text-xs text-slate-500">Sin adjuntos todavía.</p></div>}</div>
          </div>
        </div>
      )}
    </section>
  );
}
