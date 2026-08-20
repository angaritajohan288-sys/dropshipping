import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DeadlineCalendarEntry, dateKeyFromDate, groupDeadlineEntries } from "@shared/deadlineCalendar";
import { isTaskDueSoon, isTaskOverdue } from "@shared/taskDeadlines";
import { CalendarDays, CheckCircle2, ChevronRight, CircleDotDashed, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";

type DeadlineCalendarProps = {
  entries: DeadlineCalendarEntry[];
  leadDays: number;
  onOpenTask: (taskKey: string) => void;
};

function asDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

export default function DeadlineCalendar({ entries, leadDays, onOpenTask }: DeadlineCalendarProps) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const grouped = useMemo(() => groupDeadlineEntries(entries), [entries]);
  const selectedKey = selectedDate ? dateKeyFromDate(selectedDate) : undefined;
  const selectedEntries = selectedKey ? grouped.get(selectedKey) ?? [] : [];
  const visibleEntries = selectedEntries.length ? selectedEntries : Array.from(grouped.entries()).filter(([date]) => {
    const parsed = asDate(date);
    return parsed.getFullYear() === month.getFullYear() && parsed.getMonth() === month.getMonth();
  }).flatMap(([, items]) => items).slice(0, 5);
  const pending = entries.filter(entry => !entry.isCompleted);
  const overdueDates = pending.filter(entry => isTaskOverdue(entry.dueDate, entry.isCompleted)).map(entry => asDate(entry.dueDate));
  const soonDates = pending.filter(entry => isTaskDueSoon(entry.dueDate, entry.isCompleted, new Date(), leadDays)).map(entry => asDate(entry.dueDate));
  const completedDates = entries.filter(entry => entry.isCompleted).map(entry => asDate(entry.dueDate));
  const deadlineDates = entries.map(entry => asDate(entry.dueDate));

  return <section id="deadline-calendar" className="scroll-mt-20 hud-panel overflow-hidden"><div className="grid xl:grid-cols-[1fr_0.72fr]"><div className="p-5 sm:p-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="hud-label">Calendario privado // vencimientos</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.055em] text-white">Radar de fechas</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Navega entre meses, selecciona un día resaltado y abre la tarea asociada sin salir de tu espacio privado.</p></div><span className="inline-flex w-fit items-center gap-2 border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100"><CalendarDays className="size-3.5" />{entries.length} fechas</span></div><div className="mt-6 border border-cyan-200/15 bg-black/20 p-2 sm:p-4"><Calendar mode="single" month={month} onMonthChange={setMonth} selected={selectedDate} onSelect={setSelectedDate} modifiers={{ deadline: deadlineDates, overdue: overdueDates, soon: soonDates, completed: completedDates }} modifiersClassNames={{ deadline: "bg-cyan-300/15 text-cyan-50", overdue: "!bg-rose-400/25 !text-rose-50", soon: "!bg-amber-300/25 !text-amber-50", completed: "!bg-cyan-300/15 !text-cyan-50" }} className="mx-auto w-full text-slate-100" /></div><div className="mt-4 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-[0.1em]"><span className="inline-flex items-center gap-1.5 text-rose-100"><i className="size-2 bg-rose-300" />Vencida</span><span className="inline-flex items-center gap-1.5 text-amber-100"><i className="size-2 bg-amber-300" />Próxima</span><span className="inline-flex items-center gap-1.5 text-cyan-100"><i className="size-2 bg-cyan-300" />Con fecha</span></div></div><aside className="border-t border-cyan-200/10 bg-white/[0.025] p-5 xl:border-l xl:border-t-0 sm:p-7"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center border border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100"><CircleDotDashed className="size-4" /></span><div><p className="hud-label">{selectedDate ? selectedDate.toLocaleDateString("es", { day: "numeric", month: "long" }) : "Mes visible"}</p><h3 className="mt-1 text-lg font-black uppercase text-white">{selectedEntries.length ? `${selectedEntries.length} tarea${selectedEntries.length === 1 ? "" : "s"} del día` : "Próximas acciones"}</h3></div></div><div className="mt-5 space-y-3">{visibleEntries.length ? visibleEntries.map(entry => { const overdue = isTaskOverdue(entry.dueDate, entry.isCompleted); const soon = isTaskDueSoon(entry.dueDate, entry.isCompleted, new Date(), leadDays); return <button key={entry.taskKey} onClick={() => onOpenTask(entry.taskKey)} className={`w-full border p-4 text-left transition hover:-translate-y-0.5 ${overdue ? "border-rose-300/40 bg-rose-400/[0.08]" : soon ? "border-amber-300/40 bg-amber-300/[0.08]" : "border-white/10 bg-black/15 hover:border-cyan-300/35"}`}><div className="flex items-start gap-3"><span className={`mt-0.5 grid size-7 shrink-0 place-items-center border ${entry.isCompleted ? "border-cyan-300/45 text-cyan-100" : overdue ? "border-rose-300/45 text-rose-100" : soon ? "border-amber-300/45 text-amber-100" : "border-slate-500/40 text-slate-400"}`}>{entry.isCompleted ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}</span><span className="min-w-0 flex-1"><span className="text-sm font-bold text-white">{entry.title}</span><span className="mt-1 block text-xs text-slate-400">{entry.phaseName} · {entry.dueDate}</span></span><ChevronRight className="mt-1 size-4 text-cyan-200" /></div></button>; }) : <div className="border border-dashed border-slate-600/60 p-6 text-center"><CalendarDays className="mx-auto size-6 text-slate-600" /><p className="mt-3 text-sm font-bold text-white">No hay vencimientos en este mes.</p><p className="mt-2 text-xs leading-5 text-slate-500">Abre una tarea y asigna una fecha límite para verla en el radar.</p></div>}</div>{selectedDate && <Button variant="outline" onClick={() => setSelectedDate(undefined)} className="mt-5 w-full rounded-none border-slate-500/40 text-slate-300 hover:bg-white/5">Ver todo el mes</Button>}</aside></div></section>;
}
