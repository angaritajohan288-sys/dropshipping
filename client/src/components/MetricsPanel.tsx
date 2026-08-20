import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BarChart3, DollarSign, Loader2, ReceiptText, Save, ShoppingBag, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { calculateBusinessMetrics } from "@shared/businessMetrics";
import MonthlyMetricsPanel from "./MonthlyMetricsPanel";

type MetricForm = { revenue: string; productCost: string; adSpend: string; orders: string; currency: "USD" | "EUR" | "MXN" | "COP" };

const emptyForm: MetricForm = { revenue: "0", productCost: "0", adSpend: "0", orders: "0", currency: "USD" };

function fromCents(value: number) { return (value / 100).toFixed(2); }
function toCents(value: string) { return Math.max(0, Math.round((Number(value.replace(",", ".")) || 0) * 100)); }
function money(value: number, currency: string) { return new Intl.NumberFormat("es", { style: "currency", currency, maximumFractionDigits: 2 }).format(value / 100); }

function Insight({ label, value, description, icon: Icon, tone }: { label: string; value: string; description: string; icon: typeof DollarSign; tone: string }) {
  return <article className="border border-white/8 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><p className="hud-label">{label}</p><span className={`grid size-8 place-items-center border ${tone}`}><Icon className="size-4" /></span></div><p className="mt-4 text-2xl font-black tracking-[-0.05em] text-white">{value}</p><p className="mt-1 text-xs text-slate-500">{description}</p></article>;
}

export default function MetricsPanel() {
  const utils = trpc.useUtils();
  const metricsQuery = trpc.tracker.metrics.useQuery();
  const [form, setForm] = useState<MetricForm>(emptyForm);

  useEffect(() => {
    if (!metricsQuery.data) return;
    setForm({ revenue: fromCents(metricsQuery.data.revenueCents), productCost: fromCents(metricsQuery.data.productCostCents), adSpend: fromCents(metricsQuery.data.adSpendCents), orders: String(metricsQuery.data.orders), currency: metricsQuery.data.currency as MetricForm["currency"] });
  }, [metricsQuery.data]);

  const computation = useMemo(() => {
    const revenue = toCents(form.revenue);
    const productCost = toCents(form.productCost);
    const adSpend = toCents(form.adSpend);
    const orders = Math.max(0, Math.floor(Number(form.orders) || 0));
    const calculated = calculateBusinessMetrics({ revenueCents: revenue, productCostCents: productCost, adSpendCents: adSpend, orders });
    return { revenue, productCost, adSpend, orders, ...calculated };
  }, [form]);

  const saveMetrics = trpc.tracker.saveMetrics.useMutation({
    onSuccess: () => { utils.tracker.metrics.invalidate(); toast.success("Métricas guardadas en tu espacio privado."); },
    onError: () => toast.error("No se pudieron guardar las métricas."),
  });

  if (metricsQuery.isLoading) return <section className="hud-panel grid min-h-72 place-items-center"><Loader2 className="size-6 animate-spin text-cyan-200" /></section>;

  return (
    <div className="space-y-5">
    <section id="metrics" className="scroll-mt-20 hud-panel p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="hud-label">Métricas personales // dinero real</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.055em] text-white">Panel de rentabilidad</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Registra importes acumulados en la moneda seleccionada. Los cálculos son una lectura operativa, no asesoría financiera o fiscal.</p></div><span className="inline-flex w-fit items-center gap-2 border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100"><BarChart3 className="size-3.5" />Privado por usuario</span></div>
      {metricsQuery.isError ? <div className="mt-5 border border-rose-300/30 bg-rose-400/5 p-4 text-sm text-rose-100">No se pudieron cargar las métricas. <button onClick={() => metricsQuery.refetch()} className="font-bold underline">Reintentar</button></div> : <>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Insight label="Beneficio estimado" value={money(computation.netProfitCents, form.currency)} description="Ingresos menos producto y ads" icon={DollarSign} tone="border-fuchsia-300/35 bg-fuchsia-300/10 text-fuchsia-100" /><Insight label="Margen estimado" value={`${computation.marginPercent.toFixed(1)}%`} description="Sobre ingresos registrados" icon={Target} tone="border-cyan-300/35 bg-cyan-300/10 text-cyan-100" /><Insight label="ROAS" value={`${computation.roas.toFixed(2)}x`} description="Ingresos / gasto en anuncios" icon={BarChart3} tone="border-violet-300/35 bg-violet-300/10 text-violet-100" /><Insight label="Ticket promedio" value={money(computation.averageOrderValueCents, form.currency)} description={`${computation.orders} pedidos registrados`} icon={ShoppingBag} tone="border-amber-300/35 bg-amber-300/10 text-amber-100" /></div>
        <div className="mt-6 grid gap-4 border-t border-white/8 pt-6 md:grid-cols-2 xl:grid-cols-5">{([ ["revenue", "Ingresos brutos"], ["productCost", "Coste de producto"], ["adSpend", "Gasto en anuncios"] ] as const).map(([field, label]) => <label key={field} className="block"><span className="hud-label">{label}</span><input value={form[field]} inputMode="decimal" onChange={event => setForm(current => ({ ...current, [field]: event.target.value }))} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-cyan-200/70 focus:outline-none" /></label>)}<label className="block"><span className="hud-label">Pedidos</span><input value={form.orders} inputMode="numeric" onChange={event => setForm(current => ({ ...current, orders: event.target.value.replace(/\D/g, "") }))} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-cyan-200/70 focus:outline-none" /></label><label className="block"><span className="hud-label">Moneda</span><select value={form.currency} onChange={event => setForm(current => ({ ...current, currency: event.target.value as MetricForm["currency"] }))} className="mt-2 w-full border border-cyan-200/20 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-cyan-200/70 focus:outline-none"><option value="USD">USD · Dólar</option><option value="EUR">EUR · Euro</option><option value="MXN">MXN · Peso mexicano</option><option value="COP">COP · Peso colombiano</option></select></label></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs text-slate-500"><ReceiptText className="size-4" />Valores acumulados; se guardan al confirmar.</p><Button onClick={() => saveMetrics.mutate({ revenueCents: computation.revenue, productCostCents: computation.productCost, adSpendCents: computation.adSpend, orders: computation.orders, currency: form.currency })} disabled={saveMetrics.isPending} className="neon-button rounded-none px-5 text-xs font-bold uppercase tracking-[0.12em]"><Save className="mr-2 size-3.5" />{saveMetrics.isPending ? "Guardando" : "Guardar métricas"}</Button></div>
      </>}
    </section>
    <MonthlyMetricsPanel />
    </div>
  );
}
