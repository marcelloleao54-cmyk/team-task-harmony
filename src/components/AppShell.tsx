import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, KanbanSquare, FolderKanban, Users, LogOut, Code2, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VeltrionLogo } from "@/components/VeltrionLogo";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/board", label: "Quadro Kanban", icon: KanbanSquare },
  { to: "/projects", label: "Projetos", icon: FolderKanban },
  { to: "/team", label: "Equipe", icon: Users },
  { to: "/api-docs", label: "API", icon: Code2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile topbar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 font-display text-lg font-bold">
          <VeltrionLogo className="h-7 w-7" />
          Veltrion Systems
        </Link>
        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 hover:bg-accent"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static",
        )}
      >
        <div className="hidden h-16 items-center gap-2 border-b border-sidebar-border px-6 lg:flex">
          <VeltrionLogo className="h-8 w-8" />
          <span className="font-display text-xl font-bold">Veltrion Systems</span>
        </div>
        <nav className="flex-1 space-y-1 p-3 pt-20 lg:pt-3" aria-label="Navegação principal">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 text-xs">
            <div className="truncate font-medium text-sidebar-foreground">{user?.email}</div>
            <div className="text-sidebar-foreground/60">
              {isAdmin ? "Administrador" : "Membro"}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
