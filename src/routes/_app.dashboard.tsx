import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { CheckCircle2, Clock, ListTodo, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Tarefly" }] }),
  component: Dashboard,
});

const COLORS = ["oklch(0.42 0.15 255)", "oklch(0.74 0.16 75)", "oklch(0.62 0.15 155)"];
const STATUS_LABEL: Record<string, string> = { todo: "A fazer", doing: "Em andamento", done: "Concluído" };

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [tasksRes, projectsRes] = await Promise.all([
        supabase.from("tasks").select("status, priority, due_date, project_id, created_at"),
        supabase.from("projects").select("id, name, color"),
      ]);
      return { tasks: tasksRes.data ?? [], projects: projectsRes.data ?? [] };
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Carregando...</div>;

  const tasks = data?.tasks ?? [];
  const projects = data?.projects ?? [];
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const doing = tasks.filter((t) => t.status === "doing").length;
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done",
  ).length;

  const statusData = ["todo", "doing", "done"].map((s) => ({
    name: STATUS_LABEL[s],
    value: tasks.filter((t) => t.status === s).length,
  }));

  const byProject = projects.map((p) => ({
    name: p.name.length > 14 ? p.name.slice(0, 12) + "…" : p.name,
    total: tasks.filter((t) => t.project_id === p.id).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das tarefas e projetos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total" value={total} icon={ListTodo} tone="info" />
        <KpiCard label="Em andamento" value={doing} icon={Clock} tone="warning" />
        <KpiCard label="Concluídas" value={done} icon={CheckCircle2} tone="success" />
        <KpiCard label="Atrasadas" value={overdue} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas por status</CardTitle>
            <CardDescription>Distribuição atual do quadro</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas por projeto</CardTitle>
            <CardDescription>Carga de trabalho</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProject}>
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{ fill: "oklch(0.96 0.008 250)" }} />
                <Bar dataKey="total" fill="oklch(0.42 0.15 255)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label, value, icon: Icon, tone,
}: { label: string; value: number; icon: React.ElementType; tone: "info" | "success" | "warning" | "destructive" }) {
  const toneClass = {
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-bold">{value}</div>
        </div>
        <Icon className={`h-8 w-8 ${toneClass}`} aria-hidden />
      </CardContent>
    </Card>
  );
}
