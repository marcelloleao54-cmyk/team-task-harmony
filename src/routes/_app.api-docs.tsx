import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/api-docs")({
  head: () => ({ meta: [{ title: "API REST — Tarefly" }] }),
  component: ApiDocs,
});

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/tasks", desc: "Lista todas as tarefas (público, somente leitura)." },
  { method: "GET", path: "/api/v1/tasks?status=todo", desc: "Filtra por status: todo | doing | done." },
  { method: "GET", path: "/api/v1/projects", desc: "Lista todos os projetos." },
  { method: "GET", path: "/api/v1/stats", desc: "Retorna métricas agregadas (totais, por status)." },
];

function ApiDocs() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API REST</h1>
        <p className="text-muted-foreground">
          Endpoints públicos para integrar a Tarefly com seus sistemas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="block rounded-md bg-muted p-3 font-mono text-sm">{baseUrl}</code>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {ENDPOINTS.map((e) => (
          <Card key={e.path}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="default">{e.method}</Badge>
                <code className="font-mono text-sm">{e.path}</code>
              </div>
              <CardDescription>{e.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
{`curl ${baseUrl}${e.path}`}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exemplo de resposta</CardTitle>
          <CardDescription>GET /api/v1/stats</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
{`{
  "total": 42,
  "by_status": { "todo": 12, "doing": 18, "done": 12 },
  "projects": 5
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
