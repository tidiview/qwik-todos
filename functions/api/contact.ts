// functions/api/contact.ts

// Déclare PagesFunction pour éviter le conflit de types
export type PagesFunction = (context: {
  request: Request;
  env: any;
  params: Record<string, string>;
  waitUntil: (p: Promise<any>) => void;
  next: () => Promise<Response>;
}) => Response | Promise<Response>;

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const data = await request.json<{ name: string; email: string; message: string }>();

    // Relay vers ton backend Hono
    const res = await fetch("https://hono-todos.francois-vidit.workers.dev/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false }), { status: 500 });
    }

    const json = await res.json<{ ok: boolean; id: string }>();
    return Response.json(json);
  } catch (err) {
    console.error("Erreur dans contact.ts:", err);
    return new Response(JSON.stringify({ ok: false, error: "Erreur interne" }), {
      status: 500,
    });
  }
};
