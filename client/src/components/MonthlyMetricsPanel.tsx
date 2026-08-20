import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { calculateBusinessMetrics } from "@shared/businessMetrics";
import { createMonthlyMetricsCsvExport, createMonthlyMetricsCsvTemplate, METRICS_CSV_HEADERS, parseMonthlyMetricsCsv } from "@shared/csvMetrics";
import { filterMonthlyHistory, isMonthlyRangeValid } from "@shared/monthlyHistoryFilters";
import { Download, FileDown, FileUp, History, Loader2, SlidersHorizontal, Trash2 } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

function readTextFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el CSV."));
    reader.readAsText(file, "utf-8");
  });
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("es", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function downloadCsvTemplate() {
  const blob = new Blob([createMonthlyMetricsCsvTemplate()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "plantilla_metricas_mensuales.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadFilteredHistory(rows: Parameters<typeof createMonthlyMetricsCsvExport>[0], currency: string, startMonth: string, endMonth: string) {
  const blob = new Blob([createMonthlyMetricsCsvExport(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `historial_${currency}_${startMonth || "inicio"}_${endMonth || "actual"}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function MonthlyMetricsPanel() {
  const utils = trpc.useUtils();
  const historyQuery = trpc.tracker.monthlyMetrics.useQuery();
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [isReading, setIsReading] = useState(false);
  const importMetrics = trpc.tracker.importMonthlyMetrics.useMutation({
    onSuccess: result => {
      utils.tracker.monthlyMetrics.invalidate();
      toast.success(`${result.imported} mes${result.imported === 1 ? "" : "es"} actualizado${result.imported === 1 ? "" : "s"} en tu historial privado.`);
    },
    onError: () => toast.error("No se pudo guardar el historial importado."),
  });
  const deleteMonth = trpc.tracker.deleteMonthlyMetric.useMutation({
    onSuccess: () => {
      utils.tracker.monthlyMetrics.invalidate();
      toast.success("Mes retirado de tu historial privado.");
    },
    onError: () => toast.error("No se pudo retirar el mes seleccionado."),
  });

  const allRows = historyQuery.data ?? [];
  const currencies = Array.from(new Set(allRows.map(row => row.currency)));
  const activeCurrency = currencies.includes(selectedCurrency) ? selectedCurrency : currencies[0] ?? "USD";
  const invalidRange = !isMonthlyRangeValid(startMonth, endMonth);
  const filteredRows = useMemo(() => filterMonthlyHistory(allRows, { currency: activeCurrency, startMonth, endMonth }), [activeCurrency, allRows, endMonth, startMonth]);
  const chartData = useMemo(() => invalidRange ? [] : filteredRows.map(row => {
    const calculated = calculateBusinessMetrics(row);
    return { month: row.monthKey, ingresos: row.revenueCents / 100, beneficio: calculated.netProfitCents / 100, margen: Number(calculated.marginPercent.toFixed(2)), roas: Number(calculated.roas.toFixed(2)) };
  }), [filteredRows, invalidRange]);

  const handleCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("El CSV no puede superar 2 MB.");
    setIsReading(true);
    try {
      const parsed = parseMonthlyMetricsCsv(await readTextFile(file));
      if (parsed.errors.length) return toast.error(parsed.errors.slice(0, 2).join(" "));
      importMetrics.mutate({ rows: parsed.rows });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo leer el CSV.");
    } finally {
      setIsReading(false);
    }
  };

  if (historyQuery.isLoading) return <section className="hud-panel grid min-h-72 place-items-center"><Loader2 className="size-6 animate-spin text-cyan-200" /></section>;

  return <section id="monthly-history" className="scroll-mt-20 hud-panel p-5 sm:p-7">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="hud-label">Historial mensual // importación privada</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.055em] text-white">Evolución de rentabilidad</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Importa meses reales desde un CSV y filtra la serie por moneda o período. Cada fila se mantiene aislada en tu espacio privado.</p></div>
      <div className="grid w-full max-w-sm gap-2 sm:grid-cols-2 xl:grid-cols-1"><Button type="button" variant="outline" onClick={downloadCsvTemplate} className="rounded-none border-cyan-300/35 bg-cyan-300/5 text-xs font-bold uppercase tracking-[0.08em] text-cyan-100 hover:bg-cyan-300/10"><Download className="mr-2 size-3.5" />Plantilla CSV</Button><Button type="button" variant="outline" disabled={invalidRange || filteredRows.length === 0} onClick={() => downloadFilteredHistory(filteredRows, activeCurrency, startMonth, endMonth)} className="rounded-none border-violet-300/35 bg-violet-300/5 text-xs font-bold uppercase tracking-[0.08em] text-violet-100 hover:bg-violet-300/10 disabled:opacity-40"><FileDown className="mr-2 size-3.5" />Exportar filtrado</Button><div className="border border-fuchsia-300/40 bg-fuchsia-300/10 p-3"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-fuchsia-100"><FileUp className="size-4" />{isReading || importMetrics.isPending ? "Procesando CSV" : "Importar CSV"}</div><input type="file" accept=".csv,text/csv" onChange={handleCsv} disabled={isReading || importMetrics.isPending} aria-label="Seleccionar CSV de métricas mensuales" className="mt-3 w-full cursor-pointer border border-fuchsia-300/30 bg-black/25 px-2 py-1.5 text-[10px] text-slate-300 file:mr-3 file:border-0 file:bg-fuchsia-300/15 file:px-2 file:py-1 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.08em] file:text-fuchsia-100 disabled:cursor-wait disabled:opacity-60" /></div></div>
    </div>
    <div className="mt-5 border border-cyan-300/15 bg-black/25 p-4"><p className="hud-label text-cyan-100">Formato requerido</p><code className="mt-2 block overflow-x-auto text-xs text-cyan-50">{METRICS_CSV_HEADERS.join(",")}</code><p className="mt-2 text-xs leading-5 text-slate-500">La plantilla incluye una fila válida de ejemplo que puedes sustituir. `month` usa AAAA-MM; los importes aceptan hasta dos decimales; `currency` acepta USD, EUR, MXN o COP.</p></div>
    {historyQuery.isError ? <div className="mt-5 border border-rose-300/30 bg-rose-400/5 p-4 text-sm text-rose-100">No se pudo cargar el historial. <button onClick={() => historyQuery.refetch()} className="font-bold underline">Reintentar</button></div> : allRows.length === 0 ? <div className="mt-6 border border-dashed border-slate-600/60 p-8 text-center"><History className="mx-auto size-6 text-slate-600" /><p className="mt-3 text-sm font-bold text-white">Aún no hay meses importados.</p><p className="mt-2 text-xs leading-5 text-slate-500">Descarga la plantilla o carga un CSV con métricas reales para analizar su evolución.</p></div> : <>
      <div className="mt-5 border border-white/8 bg-white/[0.02] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="hud-label"><SlidersHorizontal className="mr-1 inline size-3" />Filtros de análisis</p><p className="mt-1 text-xs text-slate-500">{invalidRange ? "El mes inicial no puede ser posterior al mes final." : `${chartData.length} mes${chartData.length === 1 ? "" : "es"} en la serie activa.`}</p></div><Button type="button" variant="outline" onClick={() => { setStartMonth(""); setEndMonth(""); }} className="rounded-none border-slate-500/40 text-xs text-slate-300 hover:bg-white/5">Limpiar rango</Button></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Moneda<select value={activeCurrency} onChange={event => setSelectedCurrency(event.target.value)} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2 text-xs font-bold text-white focus:border-cyan-200/70 focus:outline-none">{currencies.map(currency => <option key={currency} value={currency}>{currency}</option>)}</select></label><label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Desde<input type="month" value={startMonth} onChange={event => setStartMonth(event.target.value)} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2 text-xs font-bold text-white focus:border-cyan-200/70 focus:outline-none" /></label><label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Hasta<input type="month" value={endMonth} onChange={event => setEndMonth(event.target.value)} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2 text-xs font-bold text-white focus:border-cyan-200/70 focus:outline-none" /></label></div></div>
      {invalidRange ? <div className="mt-5 border border-amber-300/35 bg-amber-300/5 p-4 text-sm text-amber-100">Corrige el rango de meses para ver el historial filtrado.</div> : chartData.length === 0 ? <div className="mt-5 border border-dashed border-slate-600/60 p-8 text-center"><History className="mx-auto size-6 text-slate-600" /><p className="mt-3 text-sm font-bold text-white">No hay datos para estos filtros.</p><p className="mt-2 text-xs text-slate-500">Ajusta la moneda o el rango de meses para recuperar la serie.</p></div> : <><div className="mt-5"><p className="hud-label">Serie activa</p><p className="mt-1 text-xs text-slate-500">Barras y línea izquierda: importes. Líneas derechas: margen porcentual y ROAS.</p></div><div className="mt-4 h-80 border border-white/8 bg-black/20 p-3"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData}><CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} /><YAxis yAxisId="money" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={value => money(value, activeCurrency)} /><YAxis yAxisId="ratio" orientation="right" stroke="#f9a8d4" fontSize={11} tickLine={false} axisLine={false} tickFormatter={value => `${value}`} /><Tooltip contentStyle={{ background: "#090b16", border: "1px solid rgba(34,211,.35)", borderRadius: 0 }} labelStyle={{ color: "#e2e8f0" }} formatter={(value: number, name: string) => name === "Margen" ? `${value}%` : name === "ROAS" ? `${value}x` : money(value, activeCurrency)} /><Legend /><Bar yAxisId="money" dataKey="ingresos" name="Ingresos" fill="#22d3ee" fillOpacity={0.75} /><Line yAxisId="money" type="monotone" dataKey="beneficio" name="Beneficio" stroke="#e879f9" strokeWidth={3} dot={{ r: 3 }} /><Line yAxisId="ratio" type="monotone" dataKey="margen" name="Margen" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} /><Line yAxisId="ratio" type="monotone" dataKey="roas" name="ROAS" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} /></ComposedChart></ResponsiveContainer></div><div className="mt-5 grid gap-3 md:grid-cols-3">{chartData.slice().reverse().map(row => <article key={row.month} className="border border-white/8 bg-white/[0.025] p-4"><div className="flex items-start justify-between gap-2"><p className="hud-label">{row.month}</p><button onClick={() => deleteMonth.mutate({ monthKey: row.month, currency: activeCurrency as "USD" | "EUR" | "MXN" | "COP" })} disabled={deleteMonth.isPending} className="grid size-7 place-items-center border border-rose-300/30 text-rose-100 hover:bg-rose-400/10 disabled:opacity-50" aria-label={`Retirar ${row.month} del historial`}><Trash2 className="size-3.5" /></button></div><p className="mt-2 text-lg font-black text-white">{money(row.beneficio, activeCurrency)}</p><div className="mt-3 flex justify-between text-xs text-slate-400"><span>Margen {row.margen.toFixed(1)}%</span><span>{row.roas.toFixed(2)}x ROAS</span></div></article>)}</div></>}
    </>}
  </section>;
}
