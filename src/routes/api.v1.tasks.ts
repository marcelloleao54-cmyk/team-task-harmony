import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/v1/tasks")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get("status");
        const projectId = url.searchParams.get("project_id");

        let q = supabaseAdmin
          .from("tasks")
          .select("id, title, description, status, priority, due_date, project_id, created_at")
          .order("created_at", { ascending: false })
          .limit(200);

        if (status && ["todo", "doing", "done"].includes(status)) q = q.eq("status", status);
        if (projectId) q = q.eq("project_id", projectId);

        const { data, error } = await q;
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...cors },
          });
        }
        return new Response(JSON.stringify({ data, count: data?.length ?? 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...cors },
        });
      },
    },
  },
});
