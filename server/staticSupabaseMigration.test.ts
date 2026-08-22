import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../supabase/github-pages-schema.sql", import.meta.url), "utf-8");
const staticApp = readFileSync(new URL("../client/src/pages/StaticSupabaseApp.tsx", import.meta.url), "utf-8");
const authContext = readFileSync(new URL("../client/src/contexts/SupabaseAuthContext.tsx", import.meta.url), "utf-8");
const profilePanel = readFileSync(new URL("../client/src/components/StaticProfilePanel.tsx", import.meta.url), "utf-8");
const staticMetrics = readFileSync(new URL("../client/src/components/StaticMonthlyMetricsPanel.tsx", import.meta.url), "utf-8");
const staticStyles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf-8");
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
    expect(staticApp).toContain("aria-label={`Adjuntar archivo a ${task.title}`}");
    expect(staticApp).toContain('type="file"');
  });

  it("ofrece acceso convencional con correo, contraseña, registro y recuperación", () => {
    expect(staticApp).toContain("signInWithPassword");
    expect(staticApp).toContain("signUpWithPassword");
    expect(staticApp).toContain("sendPasswordRecovery");
    expect(staticApp).toContain("Contraseña");
    expect(staticApp).toContain("Recuperar");
  });

  it("valida la confirmación y permite mostrar u ocultar las contraseñas de registro", () => {
    expect(staticApp).toContain("const [confirmation, setConfirmation]");
    expect(staticApp).toContain("password !== confirmation");
    expect(staticApp).toContain("Mostrar contraseña");
    expect(staticApp).toContain("Ocultar contraseña");
    expect(staticApp).toContain("Confirmar contraseña");
    expect(staticApp).toContain("Si ya tenías cuenta, no se crea otra: usa Entrar o Recuperar.");
  });

  it("detecta la recuperación y permite definir una contraseña nueva", () => {
    expect(staticApp).toContain("StaticPasswordUpdate");
    expect(staticApp).toContain("Actualizar contraseña");
    expect(staticApp).toContain("if (isRecovery) return <StaticPasswordUpdate />");
    expect(staticApp.indexOf("if (isRecovery) return <StaticPasswordUpdate />")).toBeLessThan(staticApp.indexOf("if (!user) return <StaticLogin />"));
    expect(staticApp).toContain("updatePassword");
    expect(authContext).toContain("isPasswordRecoveryRedirect");
    expect(authContext).toContain("window.location.hash");
    expect(authContext).toContain('hashParams.get("type") === "recovery"');
    expect(authContext).toContain('searchParams.get("recovery") === "1"');
    expect(authContext).toContain("function recoveryRedirectUrl()");
    expect(authContext).toContain('url.searchParams.set("recovery", "1")');
    expect(authContext).toContain("redirectTo: recoveryRedirectUrl()");
    expect(authContext).toContain('event === "PASSWORD_RECOVERY"');
    expect(authContext).toContain('event === "USER_UPDATED" || event === "SIGNED_OUT"');
    expect(authContext).toContain("clearPasswordRecoveryRedirect");
    expect(authContext).toContain("blitz-password-recovery-complete");
    expect(staticApp).toContain("Contraseña actualizada correctamente. Tu sesión privada está activa.");
  });

  it("usa un borrador de notas aislado con guardado explícito", () => {
    expect(staticApp).toContain("useRef<Record<string, string>>({})");
    expect(staticApp).toContain("noteDrafts.current[task.id]");
    expect(staticApp).toContain("onClick={async () =>");
    expect(staticApp).toContain("await saveTask(task.id, { note })");
    expect(staticApp).toContain("delete noteDrafts.current[task.id]");
    expect(staticApp).toContain("Guardar nota");
  });

  it("muestra el perfil autenticado de la sesión activa en el encabezado", () => {
    expect(staticApp).toContain("const profileEmail = user.email");
    expect(staticApp).toContain("Perfil autenticado: ${profileEmail}");
    expect(staticApp).toContain("sesión activa");
    expect(staticApp).toContain("BadgeCheck");
  });

  it("ofrece un perfil privado con gráficas de avance y cambio de contraseña", () => {
    expect(staticApp).toContain("StaticProfilePanel");
    expect(staticApp).toContain("setProfileOpen(true)");
    expect(profilePanel).toContain("Progreso operativo");
    expect(profilePanel).toContain("Ingresos y beneficio");
    expect(profilePanel).toContain("Cambiar contraseña");
    expect(profilePanel).toContain("Contraseña actual");
    expect(profilePanel).toContain("Confirmar contraseña");
    expect(profilePanel).toContain("changePassword(currentPassword, newPassword)");
    expect(authContext).toContain("signInWithPassword({ email: user.email, password: currentPassword })");
    expect(authContext).toContain("La contraseña actual no es correcta.");
    expect(authContext).toContain("supabase.auth.updateUser({ password: newPassword })");
  });

  it("mantiene nombres y teclado accesibles para abrir y retornar del perfil", () => {
    expect(staticApp).toContain('trigger.setAttribute("role", "button")');
    expect(staticApp).toContain('trigger.setAttribute("tabindex", "0")');
    expect(staticApp).toContain('event.key === "Enter" || event.key === " "');
    expect(staticApp).toContain('title", "Abrir perfil"');
    expect(profilePanel).toContain("onReturn");
    expect(profilePanel).toContain("Tablero");
    expect(staticStyles).toContain('[aria-label^="Perfil autenticado:"][role="button"]:focus-visible');
    expect(staticStyles).toContain("Línea de tiempo");
    expect(staticStyles).toContain("counter-reset: timeline");
    expect(readFileSync(new URL("../shared/staticPlan.ts", import.meta.url), "utf-8")).toContain("Puerta de salida");
    expect(readFileSync(new URL("../shared/staticPlan.ts", import.meta.url), "utf-8")).toContain("✦ ACTIVA");
    expect(readFileSync(new URL("../shared/staticPlan.ts", import.meta.url), "utf-8")).toContain("phase.tasks.sort");
  });

  it("prepara un despliegue de Pages con el modo estático activado", () => {
    expect(workflow).toContain("actions/deploy-pages@v4");
    expect(workflow).toContain('VITE_STATIC_SUPABASE: "true"');
    expect(workflow).toContain("VITE_BASE_PATH");
    expect(workflow).toContain("pnpm/action-setup@v4");
    expect(workflow).not.toContain('version: 10');
  });
});
