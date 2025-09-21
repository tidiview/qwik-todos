export const onRequestPost: PagesFunction = async ({ request }) => {
    console.log("Données reçues:", await request.json());
  return new Response(JSON.stringify({ ok: true, id: "123" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
