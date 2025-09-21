import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return 'https://hono-todos.francois-vidit.workers.dev';
  }
  return '/api';
};

export const useSuccessLoader = routeLoader$(async ({ params }) => {
  const res = await fetch(`${getApiBaseUrl()}/contact/${params.id}`);
  if (!res.ok) {
    return { ok: false, error: 'Impossible de retrouver le message' };
  }
  return (await res.json()) as {
    ok: boolean;
    error?: string;
    message?: {
      id: string;
      name: string;
      email: string;
      message: string;
      created_at: string;
    };
  };
});

export default component$(() => {
  const data = useSuccessLoader();

  if (!data.value.ok) {
    return (
      <div class="max-w-md mx-auto">
        <div class="bg-gray-50 shadow rounded-xl p-6 text-center text-gray-900">
          <h1 class="text-2xl font-bold mb-4 text-red-600">Erreur</h1>
          <p>{data.value.error}</p>
          <a
            href="/contact"
            class="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retour au formulaire
          </a>
        </div>
      </div>
    );
  }

  const msg = data.value.message!;

  return (
    <div class="max-w-md mx-auto">
      <div class="bg-gray-50 shadow rounded-xl p-6 text-center text-gray-900">
        <h1 class="text-2xl font-bold mb-4 text-green-700">
          Merci pour votre message 🎉
        </h1>
        <p class="mb-2">
          Votre message a bien été enregistré avec l’ID&nbsp;
          <span class="font-mono font-semibold text-blue-600">{msg.id}</span>.
        </p>

        <div class="mt-4 text-left bg-white shadow rounded-md p-4 text-gray-900">
          <p class="mb-2">
            <span class="font-medium">Nom :</span> {msg.name}
          </p>
          <p class="mb-2">
            <span class="font-medium">Email :</span> {msg.email}
          </p>
          <p class="mb-2 whitespace-pre-wrap">
            <span class="font-medium">Message :</span>
            <br />
            {msg.message}
          </p>
          <p class="mt-2 text-sm text-gray-600">
            Envoyé le {new Date(msg.created_at).toLocaleString()}
          </p>
        </div>

        <a
          href="/contact"
          class="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Envoyer un autre message
        </a>
      </div>
    </div>
  );
});
