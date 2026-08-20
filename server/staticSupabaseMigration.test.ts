import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../supabase/github-pages-schema.sql", import.meta.url), "utf-8");
const staticApp = readFileSync(new URL("../client/src/pages/StaticSupabaseApp.tsx", import.meta.url), "utf-8");
const staticMetrics = readFileSync(new URL("../client/src/components/StaticMonthlyMetricsPanel.tsx", import.meta.url), "utf-8");
const workflow = readFileSync(new URL("../.github/workflows/deploy-github-pages.yml", import.meta.url), "utf-8");

describe("static Supabase migration", () => {
  it("declara tablas privadas, RLS y almacenamiento aislado por usuario", () => {
    ["user_tracker_settings", "user_task_state", "monthly_metrics", "task_attachments"].forEach(table => {
      expect(schema).toContain(`public.${table}`);
      expect(schema).toContain(`alter table public.${table} enable row level security`);
    });
    expect(schema).toContain("auth.uid() = user_id");
    expect(schema).toContain("task-attachments");
    expect(schema).toContain("storage.foldername(name)");
    expect(schema).toContain("grant usage on schema public to authenticated");
    expect(schema).toContain("grant select, insert, update, delete on table public.user_task_state to authenticated");
    expect(schema).not.toContain("to anon");
  });

  it("mantiene auth por correo y operaciones privadas en el cliente estático", () => {
    expect(staticApp).toContain("useSupabaseAuth");
    expect(staticApp).toContain("supabase.storage.from(\"task-attachments\")");
    expect(staticApp).toContain("user_task_state");
    expect(staticApp).toContain("monthly_metrics");
    expect(staticApp).toContain("upsert({ user_id: user.id, ...previous, ...patch");
    expect(staticApp).toContain("upsert({ user_id: user.id, ...settings }");
    expect(staticMetrics).toContain("user_id: user?.id");
  });

  it("usa un editor de notas controlado con guardado explícito", () => {
    expect(staticApp).toContain("value={state.note}");
    expect(staticApp).toContain("onChange={event => setStates(current =>");
    expect(staticApp).toContain('onClick={() => saveTask(task.id, { note: state.note })}');
    expect(staticApp).toContain("Guardar nota");
  });

  it("prepara un despliegue de Pages con el modo estático activado", () => {
    expect(workflow).toContain("actions/deploy-pages@v4");
    expect(workflow).toContain('VITE_STATIC_SUPABASE: "true"');
    expect(workflow).toContain("VITE_BASE_PATH");
    expect(workflow).toContain("pnpm/action-setup@v4");
    expect(workflow).not.toContain('version: 10');
  });
});
