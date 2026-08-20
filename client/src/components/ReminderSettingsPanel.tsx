import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BellRing, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReminderSettingsPanel() {
  const utils = trpc.useUtils();
  const settingsQuery = trpc.tracker.reminderSettings.useQuery();
  const [leadDays, setLeadDays] = useState(3);
  const saveSettings = trpc.tracker.setReminderLeadDays.useMutation({
    onSuccess: result => {
      setLeadDays(result.leadDays);
      utils.tracker.reminderSettings.invalidate();
      toast.success(`Recordatorios configurados con ${result.leadDays} día${result.leadDays === 1 ? "" : "s"} de anticipación.`);
    },
    onError: () => toast.error("No se pudo guardar la anticipación de recordatorios."),
  });

  useEffect(() => {
    if (settingsQuery.data) setLeadDays(settingsQuery.data.leadDays);
  }, [settingsQuery.data]);

  return <section className="hud-panel p-5 sm:p-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center border border-amber-300/35 bg-amber-300/10 text-amber-100"><BellRing className="size-5" /></span><div><p className="hud-label text-amber-100">Recordatorios privados</p><h2 className="mt-2 text-xl font-black uppercase text-white">Anticipación de vencimientos</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Elige cuántos días antes debe aparecer la alerta ámbar en el resumen y el checklist. Las tareas vencidas seguirán destacándose en rojo.</p></div></div>{settingsQuery.isLoading ? <Loader2 className="size-5 animate-spin text-cyan-200" /> : settingsQuery.isError ? <Button variant="outline" onClick={() => settingsQuery.refetch()} className="rounded-none border-rose-300/45 text-rose-100">Reintentar</Button> : <div className="flex flex-wrap items-end gap-3"><label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Avisar con<input type="number" min={0} max={30} value={leadDays} onChange={event => setLeadDays(Math.max(0, Math.min(30, Number(event.target.value) || 0)))} aria-label="Días de anticipación para recordatorios" className="mt-2 block w-28 border border-amber-300/30 bg-black/30 px-3 py-2 text-sm font-bold text-white focus:border-amber-200/70 focus:outline-none" /></label><Button onClick={() => saveSettings.mutate({ leadDays })} disabled={saveSettings.isPending} className="rounded-none border border-amber-300/45 bg-amber-300/10 px-4 text-xs font-bold uppercase tracking-[0.1em] text-amber-100 hover:bg-amber-300/20"><Save className="mr-2 size-3.5" />{saveSettings.isPending ? "Guardando" : "Guardar"}</Button></div>}</div></section>;
}
