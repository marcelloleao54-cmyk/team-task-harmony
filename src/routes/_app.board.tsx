import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/board")({
  head: () => ({ meta: [{ title: "Quadro Kanban — Tarefly" }] }),
  component: Board,
});

type Status = "todo" | "doing" | "done";
type Priority = "low" | "medium" | "high" | "urgent";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  due_date: string | null;
  project_id: string;
  assigned_to: string | null;
  created_by: string;
}

interface Project { id: string; name: string; color: string }
interface Profile { id: string; display_name: string }

const COLUMNS: { key: Status; label: string }[] = [
  { key: "todo", label: "A fazer" },
  { key: "doing", label: "Em andamento" },
  { key: "done", label: "Concluído" },
];

const PRIORITY_BADGE: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/15 text-info",
  high: "bg-warning/15 text-warning",
  urgent: "bg-destructive/15 text-destructive",
};

function Board() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at");
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, display_name");
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const { data: tasks, refetch } = useQuery({
    queryKey: ["tasks", projectFilter],
    queryFn: async () => {
      let q = supabase.from("tasks").select("*").order("position");
      if (projectFilter !== "all") q = q.eq("project_id", projectFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        qc.invalidateQueries({ queryKey: ["tasks"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const profileMap = useMemo(
    () => new Map((profiles ?? []).map((p) => [p.id, p.display_name])),
    [profiles],
  );
  const projectMap = useMemo(
    () => new Map((projects ?? []).map((p) => [p.id, p])),
    [projects],
  );

  async function moveTask(id: string, status: Status) {
    const t = tasks?.find((x) => x.id === id);
    if (!t || t.status === status) return;
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else refetch();
  }

  async function deleteTask(id: string) {
    if (!confirm("Excluir esta tarefa?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Tarefa excluída"); refetch(); }
  }

  const noProjects = !projects || projects.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quadro Kanban</h1>
          <p className="text-muted-foreground">Arraste cartões para mudar o status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os projetos</SelectItem>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <NewTaskDialog projects={projects ?? []} profiles={profiles ?? []} userId={user!.id} onCreated={refetch} disabled={noProjects} />
        </div>
      </div>

      {noProjects ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Crie um projeto primeiro em <span className="font-medium">Projetos</span> para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = (tasks ?? []).filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (draggedId) moveTask(draggedId, col.key); setDraggedId(null); }}
                className="flex flex-col rounded-xl border border-border bg-card"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h2 className="font-semibold">{col.label}</h2>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3 min-h-[200px]">
                  {items.length === 0 && (
                    <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      Sem tarefas
                    </div>
                  )}
                  {items.map((t) => {
                    const project = projectMap.get(t.project_id);
                    const overdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== "done";
                    return (
                      <article
                        key={t.id}
                        draggable
                        onDragStart={() => setDraggedId(t.id)}
                        className="group cursor-grab rounded-lg border border-border bg-background p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="font-medium leading-tight">{t.title}</h3>
                          <button
                            onClick={() => deleteTask(t.id)}
                            aria-label="Excluir tarefa"
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                        {t.description && (
                          <p className="mb-2 text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {project && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                              {project.name}
                            </span>
                          )}
                          <span className={cn("rounded-full px-2 py-0.5 font-medium", PRIORITY_BADGE[t.priority])}>
                            {t.priority}
                          </span>
                          {t.due_date && (
                            <span className={cn("text-xs", overdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                              {format(new Date(t.due_date), "dd/MM")}
                            </span>
                          )}
                          {t.assigned_to && (
                            <span className="ml-auto text-muted-foreground">
                              {profileMap.get(t.assigned_to) ?? "—"}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-xs text-muted-foreground">
                          <GripVertical className="h-3 w-3" />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewTaskDialog({
  projects, profiles, userId, onCreated, disabled,
}: { projects: Project[]; profiles: Profile[]; userId: string; onCreated: () => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignedTo, setAssignedTo] = useState<string>("none");
  const [dueDate, setDueDate] = useState("");

  async function submit() {
    if (!title.trim() || !projectId) {
      toast.error("Título e projeto são obrigatórios");
      return;
    }
    const { error } = await supabase.from("tasks").insert({
      title: title.trim(),
      description: description.trim() || null,
      project_id: projectId,
      priority,
      due_date: dueDate || null,
      assigned_to: assignedTo === "none" ? null : assignedTo,
      created_by: userId,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Tarefa criada");
    setOpen(false);
    setTitle(""); setDescription(""); setDueDate(""); setAssignedTo("none");
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1" disabled={disabled}><Plus className="h-4 w-4" /> Nova tarefa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova tarefa</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="t-title">Título</Label>
            <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-desc">Descrição</Label>
            <Textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Projeto</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue placeholder="Escolher" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Ninguém —</SelectItem>
                  {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-due">Prazo</Label>
              <Input id="t-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
