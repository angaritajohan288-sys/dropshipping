import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../supabase/github-pages-schema.sql", import.meta.url), "utf-8");
const staticApp = readFileSync(new URL("../client/src/pages/StaticSupabaseApp.tsx", import.meta.url), "utf-8");
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
  });

  it("mantiene auth por correo y operaciones privadas en el cliente estático", () => {
    expect(staticApp).toContain("useSupabaseAuth");
    expect(staticApp).toContain("supabase.storage.from(\"task-attachments\")");
    expect(staticApp).toContain("user_task_state");
    expect(staticApp).toContain("monthly_metrics");
  });

  it("prepara un despliegue de Pages con el modo estático activado", () => {
    expect(workflow).toContain("actions/deploy-pages@v4");
    expect(workflow).toContain('VITE_STATIC_SUPABASE: "true"');
    expect(workflow).toContain("VITE_BASE_PATH");
  });
});
