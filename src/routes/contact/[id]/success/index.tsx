import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { createClient } from '@libsql/client/web';

export const useMessageLoader = routeLoader$(async ({ params, env }) => {
  const client = createClient({
    url: env.get('TURSO_DATABASE_URL')!,
    authToken: env.get('TURSO_AUTH_TOKEN')!,
  });

  const id = params.id;
  const result = await client.execute(
    'SELECT name, email, message, created_at FROM contact_messages WHERE id = ?',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Message introuvable');
  }

  const row = result.rows[0];
  return {
    name: row.name as string,
    email: row.email as string,
    message: row.message as string,
    created_at: row.created_at as string,
  };
});

export default component$(() => {
  const data = useMessageLoader();

  return (
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold mb-4">Merci pour votre message 🎉</h1>
      <p class="mb-2">Voici une copie de votre envoi :</p>
      <div class="bg-gray-100 p-4 rounded">
        <p><strong>Nom :</strong> {data.value.name}</p>
        <p><strong>Email :</strong> {data.value.email}</p>
        <p><strong>Message :</strong></p>
        <p class="whitespace-pre-line border p-2 rounded bg-white">{data.value.message}</p>
      </div>
      <p class="text-sm text-gray-500 mt-4">
        Envoyé le {new Date(data.value.created_at).toLocaleString()}
      </p>
    </div>
  );
});
