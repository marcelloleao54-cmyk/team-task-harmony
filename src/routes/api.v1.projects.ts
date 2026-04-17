import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/v1/projects")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const { data, error } = await supabaseAdmin
          .from("projects")
          .select("id, name, description, color, created_at")
          .order("created_at", { ascending: false });
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
