import DeadlineCalendar from "@/components/DeadlineCalendar";
import StaticMonthlyMetricsPanel, { type StaticMonthlyMetric } from "@/components/StaticMonthlyMetricsPanel";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { DeadlineCalendarEntry } from "@shared/deadlineCalendar";
import { PHASES, PLAN_WEEKS } from "@shared/staticPlan";
import { isTaskDueSoon, isTaskOverdue } from "@shared/taskDeadlines";
import { Check, FileText, LogOut, Moon, Sun, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type TaskState = { task_key: string; is_completed: boolean; note: string; due_date: string | null };
type Attachment = { id: string; task_key: string; file_name: string; storage_path: string };
type Settings = { start_date: string | null; reminder_lead_days: number };

const defaultSettings: Settings = { start_date: null, reminder_lead_days: 3 };

function money(value: number, currency: string) {
  return new Intl.NumberFormat("es", { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);
}

function StaticLogin() {
  const { sendMagicLink } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    const error = await sendMagicLink(email);
    setSending(false);
    setMessage(error ?? "Revisa tu correo y abre el enlace para entrar a tu espacio privado.");
  };

  return <main className="cyber-shell grid min-h-screen place-items-center px-5"><form onSubmit={submit} className="hud-panel w-full max-w-md p-8 sm:p-10"><p className="hud-label text-cyan-200">Blitz // Supabase</p><h1 className="mt-4 text-4xl font-black uppercase tracking-[-0.06em] text-white">Tu operación privada.</h1><p className="mt-4 text-sm leading-6 text-slate-300">Inicia con un enlace seguro. Progreso, métricas, fechas, notas y adjuntos se guardan por usuario.</p><label className="mt-7 block hud-label">Correo electrónico</label><input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="tu@correo.com" className="mt-2 w-full border border-cyan-200/30 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-200/80 focus:outline-none" /><Button disabled={sending} className="neon-button mt-4 w-full rounded-none py-6 font-bold uppercase tracking-[0.14em]">{sending ? "Enviando enlace" : "Enviar enlace de acceso"}</Button>{message && <p className="mt-5 border border-cyan-200/25 bg-cyan-300/10 p-3 text-xs leading-5 text-cyan-50">{message}</p>}</form></main>;
}

export default function StaticSupabaseApp() {
  const { user, loading, signOut } = useSupabaseAuth();
  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("blitz-theme") as "dark" | "light") || "dark");
  const [states, setStates] = useState<TaskState[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [metrics, setMetrics] = useState<StaticMonthlyMetric[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activePhase, setActivePhase] = useState(PHASES[0].id);
  const [openedTask, setOpenedTask] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("blitz-theme", theme);
  }, [theme]);

  const load = useCallback(async () => {
    if (!user) return;
    const [taskResult, settingResult, metricResult, attachmentResult] = await Promise.all([
      supabase.from("user_task_state").select("task_key,is_completed,note,due_date"),
      supabase.from("user_tracker_settings").select("start_date,reminder_lead_days").maybeSingle(),
      supabase.from("monthly_metrics").select("month,revenue,product_cost,ad_spend,orders,currency").order("month", { ascending: false }),
      supabase.from("task_attachments").select("id,task_key,file_name,storage_path").order("created_at", { ascending: false }),
    ]);
    const error = taskResult.error ?? settingResult.error ?? metricResult.error ?? attachmentResult.error;
    if (error) setNotice(error.message);
    if (taskResult.data) setStates(taskResult.data as TaskState[]);
    if (settingResult.data) setSettings(settingResult.data as Settings);
    if (metricResult.data) setMetrics(metricResult.data as StaticMonthlyMetric[]);
    if (attachmentResult.data) setAttachments(attachmentResult.data as Attachment[]);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  if (loading) return <main className="grid min-h-screen place-items-center"><p className="hud-label">Conectando espacio privado</p></main>;
  if (!user) return <StaticLogin />;

  const stateByTask = new Map(states.map(state => [state.task_key, state]));
  const allTasks = PHASES.flatMap(phase => phase.tasks.map(task => ({ ...task, phase })));
  const phase = PHASES.find(item => item.id === activePhase) ?? PHASES[0];
  const calendarEntries: DeadlineCalendarEntry[] = allTasks.flatMap(task => {
    const state = stateByTask.get(task.id);
    return state?.due_date ? [{ taskKey: task.id, title: task.title, phaseName: task.phase.name, dueDate: state.due_date, isCompleted: state.is_completed }] : [];
  });
  const overdue = calendarEntries.filter(item => isTaskOverdue(item.dueDate, item.isCompleted));
  const dueSoon = calendarEntries.filter(item => isTaskDueSoon(item.dueDate, item.isCompleted, new Date(), settings.reminder_lead_days));
  const completed = states.filter(item => item.is_completed).length;
  const primaryCurrency = metrics[0]?.currency ?? "USD";
  const netProfit = metrics.reduce((sum, item) => sum + Number(item.revenue) - Number(item.product_cost) - Number(item.ad_spend), 0);

  const saveTask = async (taskKey: string, patch: Partial<TaskState>) => {
    const previous = stateByTask.get(taskKey) ?? { task_key: taskKey, is_completed: false, note: "", due_date: null };
    const { error } = await supabase.from("user_task_state").upsert({ user_id: user.id, ...previous, ...patch, task_key: taskKey }, { onConflict: "user_id,task_key" });
    if (error) return setNotice(error.message);
    await load();
  };

  const saveSettings = async () => {
    const { error } = await supabase.from("user_tracker_settings").upsert({ user_id: user.id, ...settings }, { onConflict: "user_id" });
    if (error) setNotice(error.message); else setNotice("Configuración de cronograma y recordatorios guardada.");
  };

  const upload = async (taskKey: string, file: File) => {
    if (file.size > 6 * 1024 * 1024) return setNotice("Cada adjunto puede pesar hasta 6 MB.");
    const storagePath = `${user.id}/${taskKey}/${crypto.randomUUID()}-${file.name}`;
    const uploadResult = await supabase.storage.from("task-attachments").upload(storagePath, file, { upsert: false });
    if (uploadResult.error) return setNotice(uploadResult.error.message);
    const record = await supabase.from("task_attachments").insert({ task_key: taskKey, file_name: file.name, storage_path: storagePath });
    if (record.error) return setNotice(record.error.message);
    await load();
  };

  const removeAttachment = async (attachment: Attachment) => {
    const [{ error: storageError }, { error: rowError }] = await Promise.all([
      supabase.storage.from("task-attachments").remove([attachment.storage_path]),
      supabase.from("task_attachments").delete().eq("id", attachment.id),
    ]);
    if (storageError || rowError) return setNotice(storageError?.message ?? rowError?.message ?? "No se pudo retirar el adjunto.");
    await load();
  };

  const openAttachment = async (storagePath: string) => {
    const { data, error } = await supabase.storage.from("task-attachments").createSignedUrl(storagePath, 60);
    if (error || !data?.signedUrl) return setNotice(error?.message ?? "No se pudo abrir el adjunto.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const openCalendarTask = (taskKey: string) => {
    const task = allTasks.find(item => item.id === taskKey);
    if (task) setActivePhase(task.phase.id);
    setOpenedTask(taskKey);
    document.getElementById("static-checklist")?.scrollIntoView({ behavior: "smooth" });
  };

  return <main className="cyber-shell min-h-screen"><header className="sticky top-0 z-50 border-b border-cyan-200/15 bg-[#07070d]/90 px-4 py-3 backdrop-blur-xl light:bg-[#edf4fb]/95"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3"><div><p className="hud-label text-cyan-200">Blitz // Supabase static</p><p className="text-sm font-black uppercase text-white">Ecom command</p></div><div className="flex gap-2"><button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="grid size-10 place-items-center border border-cyan-200/30 text-cyan-100" aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>{theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}</button><button onClick={signOut} className="grid size-10 place-items-center border border-rose-300/35 text-rose-200" aria-label="Cerrar sesión"><LogOut className="size-4" /></button></div></div></header><div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-7"><section className="hud-panel p-6 sm:p-8"><p className="hud-label text-cyan-200">Operación privada // GitHub Pages</p><div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-4xl font-black uppercase tracking-[-0.07em] text-white sm:text-6xl">Construye. <span className="neon-text">Escala.</span></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Sesión por correo, datos aislados por RLS y archivos privados en Supabase. La interfaz se publica como sitio estático.</p></div><div className="border border-cyan-200/20 bg-black/25 p-4 text-right"><p className="hud-label">Progreso</p><p className="mt-2 text-4xl font-black text-white">{Math.round((completed / allTasks.length) * 100)}%</p><p className="mt-1 text-xs text-slate-400">{completed} de {allTasks.length} tareas</p></div></div></section>{notice && <div className="border border-cyan-300/35 bg-cyan-300/10 p-3 text-sm text-cyan-50">{notice}</div>}<section className="grid gap-4 md:grid-cols-3"><article className="hud-panel p-5"><p className="hud-label">Vencidas</p><p className="mt-3 text-3xl font-black text-rose-200">{overdue.length}</p></article><article className="hud-panel p-5"><p className="hud-label">Próximas ({settings.reminder_lead_days} días)</p><p className="mt-3 text-3xl font-black text-amber-100">{dueSoon.length}</p></article><article className="hud-panel p-5"><p className="hud-label">Beneficio acumulado</p><p className="mt-3 text-3xl font-black text-cyan-100">{money(netProfit, primaryCurrency)}</p></article></section><section id="static-checklist" className="grid gap-5 xl:grid-cols-[0.28fr_1fr]"><aside className="hud-panel p-4"><p className="hud-label">Fases</p><div className="mt-4 space-y-2">{PHASES.map(item => <button key={item.id} onClick={() => setActivePhase(item.id)} className={`w-full border p-3 text-left ${item.id === phase.id ? "border-fuchsia-300/60 bg-fuchsia-300/10" : "border-white/10"}`}><p className="text-xs font-black uppercase text-white">{item.name}</p><p className="mt-1 text-[10px] text-slate-400">{item.objective}</p></button>)}</div></aside><article className="hud-panel overflow-hidden"><div className="border-b border-cyan-200/10 p-5 sm:p-7"><p className="hud-label">{phase.shortLabel}</p><h2 className="mt-2 text-3xl font-black uppercase text-white">{phase.name}</h2></div><div className="divide-y divide-white/10">{phase.tasks.map(task => { const state = stateByTask.get(task.id) ?? { task_key: task.id, is_completed: false, note: "", due_date: null }; const open = openedTask === task.id; const files = attachments.filter(file => file.task_key === task.id); return <div key={task.id} className={isTaskOverdue(state.due_date ?? undefined, state.is_completed) ? "border-l-2 border-rose-300 bg-rose-400/[0.04]" : ""}><div className="flex gap-3 p-5"><button onClick={() => saveTask(task.id, { is_completed: !state.is_completed })} className={`grid size-7 shrink-0 place-items-center border ${state.is_completed ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-slate-500 text-slate-400"}`} aria-label={`Cambiar estado de ${task.title}`}>{state.is_completed && <Check className="size-4" />}</button><button onClick={() => setOpenedTask(open ? null : task.id)} className="min-w-0 flex-1 text-left"><p className={`font-bold ${state.is_completed ? "text-cyan-100 line-through" : "text-white"}`}>{task.title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{task.detail}</p>{state.due_date && <p className="mt-2 text-[10px] font-bold uppercase text-amber-100">Límite: {state.due_date}</p>}</button><FileText className="size-4 text-cyan-200" /></div>{open && <div className="border-t border-white/10 bg-black/15 p-5"><label className="hud-label">Nota privada</label><textarea value={state.note} onChange={event => setStates(current => { const existing = current.find(item => item.task_key === task.id) ?? { task_key: task.id, is_completed: false, note: "", due_date: null }; const next = { ...existing, note: event.target.value }; return current.some(item => item.task_key === task.id) ? current.map(item => item.task_key === task.id ? next : item) : [...current, next]; })} onBlur={event => saveTask(task.id, { note: event.currentTarget.value })} className="mt-2 min-h-24 w-full border border-cyan-200/20 bg-black/30 p-3 text-sm text-white" placeholder="Añade contexto, decisión o enlace…" /><Button type="button" onClick={() => saveTask(task.id, { note: state.note })} className="mt-3 rounded-none border border-cyan-300/35 bg-cyan-300/10 text-xs font-bold uppercase text-cyan-100">Guardar nota</Button><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="hud-label">Fecha límite<input type="date" defaultValue={state.due_date ?? ""} onChange={event => saveTask(task.id, { due_date: event.target.value || null })} className="mt-2 block w-full border border-cyan-200/20 bg-black/30 px-3 py-2 text-sm text-white" /></label><label className="mt-6 flex cursor-pointer items-center gap-2 border border-cyan-300/35 px-3 py-2 text-xs font-bold uppercase text-cyan-100"><Upload className="size-4" />Adjuntar<input type="file" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) upload(task.id, file); }} /></label></div>{files.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{files.map(file => <span key={file.id} className="flex items-center gap-1 border border-cyan-300/30 px-2 py-1 text-xs text-cyan-100"><button onClick={() => openAttachment(file.storage_path)}>{file.file_name}</button><button onClick={() => removeAttachment(file)} aria-label={`Eliminar ${file.file_name}`} className="text-rose-200"><Trash2 className="size-3" /></button></span>)}</div>}</div>}</div>; })}</div></article></section><DeadlineCalendar entries={calendarEntries} leadDays={settings.reminder_lead_days} onOpenTask={openCalendarTask} /><section className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]"><article className="hud-panel p-5"><p className="hud-label">Ajustes privados</p><h2 className="mt-2 text-xl font-black uppercase text-white">Ritmo de recordatorios</h2><label className="mt-5 block text-xs text-slate-300">Inicio del cronograma<input type="date" value={settings.start_date ?? ""} onChange={event => setSettings({ ...settings, start_date: event.target.value || null })} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2 text-white" /></label><label className="mt-4 block text-xs text-slate-300">Días de anticipación<input type="number" min="0" max="30" value={settings.reminder_lead_days} onChange={event => setSettings({ ...settings, reminder_lead_days: Math.min(30, Math.max(0, Number(event.target.value))) })} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2 text-white" /></label><Button onClick={saveSettings} className="neon-button mt-4 rounded-none">Guardar ajustes</Button></article><StaticMonthlyMetricsPanel metrics={metrics} reload={load} report={setNotice} /></section><section className="grid gap-3 sm:grid-cols-4">{PLAN_WEEKS.map(week => <div key={week.number} className="hud-panel p-4"><p className="hud-label">Semana {week.number}</p><p className="mt-2 font-black uppercase text-white">{week.label}</p><p className="mt-2 text-xs text-slate-400">{week.focus}</p></div>)}</section></div></main>;
}
