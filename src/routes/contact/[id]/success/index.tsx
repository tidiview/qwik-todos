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
      <h1 class="text-2xl font-semibold mb-4 text-center text-green-700">
        Merci pour votre message 🎉
      </h1>

      <div class="flex flex-col gap-4 bg-white shadow rounded-xl p-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom</label>
          <p class="mt-1 border rounded-md bg-gray-50 px-3 py-2 text-gray-800">
            {data.value.name}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <p class="mt-1 border rounded-md bg-gray-50 px-3 py-2 text-gray-800">
            {data.value.email}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Message</label>
          <p class="mt-1 border rounded-md bg-gray-50 px-3 py-2 text-gray-800 whitespace-pre-line">
            {data.value.message}
          </p>
        </div>
      </div>

      <p class="text-sm text-gray-500 mt-4 text-center">
        Envoyé le {new Date(data.value.created_at).toLocaleString()}
      </p>

      <div class="text-center mt-6">
        <a
          href="/contact/"
          class="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Envoyer un autre message
        </a>
      </div>
    </div>
  );
});
