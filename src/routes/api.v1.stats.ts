import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/v1/stats")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const [tasksRes, projectsRes] = await Promise.all([
          supabaseAdmin.from("tasks").select("status"),
          supabaseAdmin.from("projects").select("id"),
        ]);
        if (tasksRes.error || projectsRes.error) {
          return new Response(
            JSON.stringify({ error: tasksRes.error?.message ?? projectsRes.error?.message }),
            { status: 500, headers: { "Content-Type": "application/json", ...cors } },
          );
        }
        const tasks = tasksRes.data ?? [];
        const by_status = { todo: 0, doing: 0, done: 0 };
        for (const t of tasks) {
          if (t.status in by_status) by_status[t.status as keyof typeof by_status]++;
        }
        return new Response(
          JSON.stringify({
            total: tasks.length,
            by_status,
            projects: projectsRes.data?.length ?? 0,
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...cors } },
        );
      },
    },
  },
});
