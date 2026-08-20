import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { calculateBusinessMetrics } from "@shared/businessMetrics";
import { createMonthlyMetricsCsvExport, createMonthlyMetricsCsvTemplate, METRICS_CSV_HEADERS, parseMonthlyMetricsCsv } from "@shared/csvMetrics";
import { filterMonthlyHistory, isMonthlyRangeValid } from "@shared/monthlyHistoryFilters";
import { Download, FileDown, FileUp, History, SlidersHorizontal, Trash2 } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type StaticMonthlyMetric = { month: string; revenue: number; product_cost: number; ad_spend: number; orders: number; currency: string };

function money(value: number, currency: string) {
  return new Intl.NumberFormat("es", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function download(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function readText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el CSV."));
    reader.readAsText(file, "utf-8");
  });
}

export default function StaticMonthlyMetricsPanel({ metrics, reload, report }: { metrics: StaticMonthlyMetric[]; reload: () => Promise<void>; report: (message: string) => void }) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [working, setWorking] = useState(false);
  const currencies = Array.from(new Set(metrics.map(row => row.currency)));
  const activeCurrency = currencies.includes(selectedCurrency) ? selectedCurrency : currencies[0] ?? "USD";
  const invalidRange = !isMonthlyRangeValid(startMonth, endMonth);
  const rows = useMemo(() => metrics.map(row => ({
    ...row,
    monthKey: row.month.slice(0, 7),
    revenueCents: Math.round(Number(row.revenue) * 100),
    productCostCents: Math.round(Number(row.product_cost) * 100),
    adSpendCents: Math.round(Number(row.ad_spend) * 100),
  })), [metrics]);
  const filtered = useMemo(() => filterMonthlyHistory(rows, { currency: activeCurrency, startMonth, endMonth }), [activeCurrency, endMonth, rows, startMonth]);
  const chartRows = useMemo(() => invalidRange ? [] : filtered.map(row => {
    const calculated = calculateBusinessMetrics(row);
    return { month: row.monthKey, ingresos: row.revenueCents / 100, beneficio: calculated.netProfitCents / 100, margen: Number(calculated.marginPercent.toFixed(2)), roas: Number(calculated.roas.toFixed(2)) };
  }), [filtered, invalidRange]);

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return report("El CSV no puede superar 2 MB.");
    setWorking(true);
    try {
      const parsed = parseMonthlyMetricsCsv(await readText(file));
      if (parsed.errors.length) return report(parsed.errors.slice(0, 2).join(" "));
      const { error } = await supabase.from("monthly_metrics").upsert(parsed.rows.map(row => ({
        month: `${row.monthKey}-01`, revenue: row.revenueCents / 100, product_cost: row.productCostCents / 100,
        ad_spend: row.adSpendCents / 100, orders: row.orders, currency: row.currency,
      })), { onConflict: "user_id,month" });
      if (error) return report(error.message);
      await reload();
      report(`${parsed.rows.length} mes${parsed.rows.length === 1 ? "" : "es"} actualizado${parsed.rows.length === 1 ? "" : "s"}.`);
    } catch (error) {
      report(error instanceof Error ? error.message : "No se pudo importar el CSV.");
    } finally {
      setWorking(false);
    }
  };

  const deleteMonth = async (month: string, currency: string) => {
    const { error } = await supabase.from("monthly_metrics").delete().eq("month", month).eq("currency", currency);
    if (error) return report(error.message);
    await reload();
  };

  return <section id="monthly-history" className="scroll-mt-20 hud-panel p-5 sm:p-7">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="hud-label">Historial mensual // Supabase</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.055em] text-white">Evolución de rentabilidad</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Importa datos reales, filtra por moneda o período y exporta exactamente la serie activa.</p></div><div className="grid w-full max-w-sm gap-2 sm:grid-cols-2 xl:grid-cols-1"><Button type="button" variant="outline" onClick={() => download(createMonthlyMetricsCsvTemplate(), "plantilla_metricas_mensuales.csv")} className="rounded-none border-cyan-300/35 bg-cyan-300/5 text-xs font-bold uppercase tracking-[0.08em] text-cyan-100"><Download className="mr-2 size-3.5" />Plantilla CSV</Button><Button type="button" variant="outline" disabled={invalidRange || filtered.length === 0} onClick={() => download(createMonthlyMetricsCsvExport(filtered), `historial_${activeCurrency}_${startMonth || "inicio"}_${endMonth || "actual"}.csv`)} className="rounded-none border-violet-300/35 bg-violet-300/5 text-xs font-bold uppercase tracking-[0.08em] text-violet-100 disabled:opacity-40"><FileDown className="mr-2 size-3.5" />Exportar filtrado</Button><label className="border border-fuchsia-300/40 bg-fuchsia-300/10 p-3 text-xs font-bold uppercase tracking-[0.12em] text-fuchsia-100"><span className="flex gap-2"><FileUp className="size-4" />{working ? "Procesando" : "Importar CSV"}</span><input type="file" accept=".csv,text/csv" onChange={importCsv} disabled={working} aria-label="Seleccionar CSV de métricas mensuales" className="mt-3 w-full cursor-pointer border border-fuchsia-300/30 bg-black/25 px-2 py-1.5 text-[10px] text-slate-300 file:mr-3 file:border-0 file:bg-fuchsia-300/15 file:px-2 file:py-1 file:text-[10px] file:font-bold file:uppercase file:text-fuchsia-100 disabled:opacity-60" /></label></div></div>
    <div className="mt-5 border border-cyan-300/15 bg-black/25 p-4"><p className="hud-label text-cyan-100">Formato requerido</p><code className="mt-2 block overflow-x-auto text-xs text-cyan-50">{METRICS_CSV_HEADERS.join(",")}</code></div>
    {metrics.length === 0 ? <div className="mt-6 border border-dashed border-slate-600/60 p-8 text-center"><History className="mx-auto size-6 text-slate-600" /><p className="mt-3 text-sm font-bold text-white">Aún no hay meses importados.</p></div> : <><div className="mt-5 border border-white/8 bg-white/[0.02] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="hud-label"><SlidersHorizontal className="mr-1 inline size-3" />Filtros de análisis</p><p className="mt-1 text-xs text-slate-500">{invalidRange ? "El mes inicial no puede ser posterior al mes final." : `${chartRows.length} mes${chartRows.length === 1 ? "" : "es"} en la serie activa.`}</p></div><Button type="button" variant="outline" onClick={() => { setStartMonth(""); setEndMonth(""); }} className="rounded-none border-slate-500/40 text-xs text-slate-300">Limpiar rango</Button></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="hud-label">Moneda<select value={activeCurrency} onChange={event => setSelectedCurrency(event.target.value)} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2 text-xs font-bold text-white">{currencies.map(item => <option key={item} value={item}>{item}</option>)}</select></label><label className="hud-label">Desde<input type="month" value={startMonth} onChange={event => setStartMonth(event.target.value)} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2 text-xs font-bold text-white" /></label><label className="hud-label">Hasta<input type="month" value={endMonth} onChange={event => setEndMonth(event.target.value)} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2 text-xs font-bold text-white" /></label></div></div>{invalidRange ? <div className="mt-5 border border-amber-300/35 bg-amber-300/5 p-4 text-sm text-amber-100">Corrige el rango de meses para ver el historial filtrado.</div> : chartRows.length === 0 ? <div className="mt-5 border border-dashed border-slate-600/60 p-8 text-center"><p className="text-sm font-bold text-white">No hay datos para estos filtros.</p></div> : <><div className="mt-4 h-80 border border-white/8 bg-black/20 p-3"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartRows}><CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} /><YAxis yAxisId="money" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={value => money(value, activeCurrency)} /><YAxis yAxisId="ratio" orientation="right" stroke="#f9a8d4" fontSize={11} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: "#090b16", border: "1px solid rgba(34,211,.35)", borderRadius: 0 }} formatter={(value: number, name: string) => name === "Margen" ? `${value}%` : name === "ROAS" ? `${value}x` : money(value, activeCurrency)} /><Legend /><Bar yAxisId="money" dataKey="ingresos" name="Ingresos" fill="#22d3ee" fillOpacity={0.75} /><Line yAxisId="money" type="monotone" dataKey="beneficio" name="Beneficio" stroke="#e879f9" strokeWidth={3} /><Line yAxisId="ratio" type="monotone" dataKey="margen" name="Margen" stroke="#fbbf24" strokeWidth={2} /><Line yAxisId="ratio" type="monotone" dataKey="roas" name="ROAS" stroke="#a78bfa" strokeWidth={2} /></ComposedChart></ResponsiveContainer></div><div className="mt-5 grid gap-3 md:grid-cols-3">{chartRows.slice().reverse().map(row => <article key={row.month} className="border border-white/8 bg-white/[0.025] p-4"><div className="flex items-start justify-between gap-2"><p className="hud-label">{row.month}</p><button onClick={() => deleteMonth(`${row.month}-01`, activeCurrency)} className="grid size-7 place-items-center border border-rose-300/30 text-rose-100" aria-label={`Retirar ${row.month} del historial`}><Trash2 className="size-3.5" /></button></div><p className="mt-2 text-lg font-black text-white">{money(row.beneficio, activeCurrency)}</p><div className="mt-3 flex justify-between text-xs text-slate-400"><span>Margen {row.margen.toFixed(1)}%</span><span>{row.roas.toFixed(2)}x ROAS</span></div></article>)}</div></>}</>}</section>;
}
