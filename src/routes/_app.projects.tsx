import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projetos — Tarefly" }] }),
  component: Projects,
});

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function Projects() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const { data: projects, refetch } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, tasks(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function create() {
    if (!name.trim()) return toast.error("Nome obrigatório");
    const { error } = await supabase.from("projects").insert({
      name: name.trim(),
      description: description.trim() || null,
      color,
      created_by: user!.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Projeto criado");
    setOpen(false); setName(""); setDescription(""); setColor(COLORS[0]);
    refetch();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este projeto e todas as tarefas?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Projeto excluído");
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">Organize tarefas por iniciativa.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1"><Plus className="h-4 w-4" /> Novo projeto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo projeto</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Nome</Label>
                <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-desc">Descrição</Label>
                <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Cor ${c}`}
                      onClick={() => setColor(c)}
                      className="h-8 w-8 rounded-full ring-offset-2 transition-all"
                      style={{ backgroundColor: c, outline: color === c ? "2px solid currentColor" : "none" }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={create}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum projeto ainda.</CardContent></Card>
        )}
        {projects?.map((p: { id: string; name: string; description: string | null; color: string; tasks: { count: number }[] }) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded" style={{ backgroundColor: p.color }} />
                  <CardTitle className="text-base">{p.name}</CardTitle>
                </div>
                {isAdmin && (
                  <button onClick={() => remove(p.id)} aria-label="Excluir projeto">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>
              {p.description && <CardDescription>{p.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {p.tasks?.[0]?.count ?? 0} tarefa(s)
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
