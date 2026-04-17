import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, KanbanSquare, BarChart3, Users, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tarefly — Gestão corporativa de tarefas" },
      {
        name: "description",
        content:
          "Kanban, equipes, dashboard analítico e API REST para empresas que precisam de produtividade real.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" aria-hidden />
            <span className="font-display text-xl font-bold">Tarefly</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/login" search={{ mode: "signup" }}>
              <Button size="sm">Criar conta</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Para times corporativos
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Gestão de tarefas
            <span className="block text-primary">sem fricção.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Quadro Kanban, projetos, prazos, atribuição por papéis e analytics em tempo real.
            Tudo em uma plataforma corporativa rápida e acessível.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link to="/login" search={{ mode: "signup" }}>
              <Button size="lg" className="gap-2">
                Começar grátis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/api-docs">
              <Button size="lg" variant="outline">Ver API</Button>
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: KanbanSquare, title: "Kanban", desc: "Arraste tarefas entre colunas." },
            { icon: Users, title: "Equipes", desc: "Atribua e acompanhe responsáveis." },
            { icon: BarChart3, title: "Analytics", desc: "Dashboard com indicadores." },
            { icon: Code2, title: "API REST", desc: "Integre com seus sistemas." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <Icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-4 font-semibold text-card-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Tarefly. Todos os direitos reservados.
      </footer>
    </div>
  );
}
