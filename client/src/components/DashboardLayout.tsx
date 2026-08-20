import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { CalendarDays, Crosshair, LayoutDashboard, LogOut, PanelLeft, ShieldAlert, Sparkles } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

const menuItems = [
  { icon: LayoutDashboard, label: "Centro de mando", target: "overview" },
  { icon: Crosshair, label: "Fases", target: "plan" },
  { icon: CalendarDays, label: "Cronograma", target: "timeline" },
  { icon: ShieldAlert, label: "Inteligencia", target: "intelligence" },
];

const SIDEBAR_WIDTH_KEY = "blitz-sidebar-width";
const DEFAULT_WIDTH = 276;
const MIN_WIDTH = 232;
const MAX_WIDTH = 360;

function scrollToSection(target: string) {
  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? Number.parseInt(saved, 10) || DEFAULT_WIDTH : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <main className="min-h-screen grid place-items-center px-5 cyber-shell">
        <section className="hud-panel max-w-lg p-8 sm:p-10 text-center">
          <div className="mx-auto mb-7 grid size-16 place-items-center border border-cyan-300/60 bg-cyan-300/10 text-cyan-200 shadow-[0_0_32px_rgba(34,211,238,0.28)]">
            <Sparkles className="size-7" />
          </div>
          <p className="hud-label">ACCESO RESTRINGIDO // NODO PERSONAL</p>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-[-0.05em] text-white sm:text-4xl">Inicia tu operación.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-300">
            Tu checklist, prioridades y progreso se almacenan en un espacio privado asociado a tu cuenta.
          </p>
          <Button onClick={startLogin} className="neon-button mt-8 w-full rounded-none py-6 font-bold uppercase tracking-[0.15em]">
            Conectar identidad
          </Button>
        </section>
      </main>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <LayoutContent setSidebarWidth={setSidebarWidth}>{children}</LayoutContent>
    </SidebarProvider>
  );
}

function LayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const next = event.clientX - left;
      if (next >= MIN_WIDTH && next <= MAX_WIDTH) setSidebarWidth(next);
    };
    const onUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div ref={sidebarRef} className="relative">
        <Sidebar collapsible="icon" className="border-r border-r-cyan-200/15 bg-[#07070d]/95 backdrop-blur-xl" disableTransition={isResizing}>
          <SidebarHeader className="h-auto border-b border-cyan-200/10 px-3 py-4">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} aria-label="Alternar navegación" className="grid size-9 shrink-0 place-items-center border border-cyan-200/25 bg-cyan-300/5 text-cyan-100 transition hover:border-cyan-200/70 hover:bg-cyan-300/10">
                <PanelLeft className="size-4" />
              </button>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.22em] text-cyan-200">BLITZ // OS</p>
                  <p className="truncate text-sm font-black uppercase tracking-tight text-white">Ecom Command</p>
                </div>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent className="pt-5">
            <p className="px-5 pb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500 group-data-[collapsible=icon]:hidden">Navegación</p>
            <SidebarMenu className="gap-1 px-3">
              {menuItems.map(item => (
                <SidebarMenuItem key={item.target}>
                  <SidebarMenuButton
                    onClick={() => scrollToSection(item.target)}
                    tooltip={item.label}
                    className="h-11 rounded-none border border-transparent px-3 text-slate-300 transition hover:border-fuchsia-300/30 hover:bg-fuchsia-400/10 hover:text-fuchsia-100 data-[active=true]:bg-transparent"
                  >
                    <item.icon className="size-4 text-cyan-200" />
                    <span className="text-xs font-semibold uppercase tracking-[0.11em]">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-cyan-200/10 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 border border-transparent px-2 py-2 text-left transition hover:border-cyan-200/25 hover:bg-cyan-300/5 group-data-[collapsible=icon]:justify-center">
                  <Avatar className="size-8 rounded-none border border-fuchsia-300/50 bg-fuchsia-300/10">
                    <AvatarFallback className="rounded-none bg-transparent text-xs font-black text-fuchsia-100">{user?.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-xs font-bold text-white">{user?.name ?? "Operador"}</p>
                    <p className="mt-0.5 truncate text-[10px] uppercase tracking-wide text-slate-500">Sesión privada</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-none border-cyan-200/20 bg-[#10101c] text-slate-100">
                <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-none text-rose-300 focus:bg-rose-400/10 focus:text-rose-200">
                  <LogOut className="mr-2 size-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        {!isCollapsed && <div onMouseDown={() => setIsResizing(true)} className="absolute inset-y-0 right-0 z-50 w-1 cursor-col-resize bg-transparent hover:bg-cyan-200/50" />}
      </div>
      <SidebarInset className="cyber-shell bg-transparent">
        {isMobile && (
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-cyan-200/15 bg-[#07070d]/90 px-3 backdrop-blur-xl">
            <div className="flex items-center gap-3"><SidebarTrigger className="rounded-none border border-cyan-200/25" /><span className="text-xs font-black uppercase tracking-[0.14em] text-white">Blitz // OS</span></div>
            <span className="text-[9px] font-bold tracking-[0.18em] text-cyan-200">ONLINE</span>
          </header>
        )}
        <main className="min-h-screen p-3 sm:p-5 lg:p-7">{children}</main>
      </SidebarInset>
    </>
  );
}
