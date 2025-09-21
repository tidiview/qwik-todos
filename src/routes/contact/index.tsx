import { component$ } from '@builder.io/qwik';
import { routeAction$, Form } from '@builder.io/qwik-city';
import {
  object,
  string,
  email,
  minLength,
  maxLength,
  pipe,
  safeParse,
  InferOutput,
} from 'valibot';

// --- Schéma Valibot ---
const contactSchema = object({
  name: pipe(
    string(),
    minLength(1, '⚠️ Merci d’entrer votre nom'),
    maxLength(100, 'Nom trop long')
  ),
  email: pipe(
    string(),
    email('⚠️ Adresse email invalide'),
    maxLength(255, 'Email trop long')
  ),
  message: pipe(
    string(),
    minLength(1, '⚠️ Merci d’écrire un message'),
    maxLength(5000, 'Message trop long')
  ),
});
type ContactData = InferOutput<typeof contactSchema>;

// --- Type des erreurs pour être plus strict ---
type FieldErrors = {
  name?: string[];
  email?: string[];
  message?: string[];
  _form?: string[];
};

// --- Choix dynamique de l’API ---
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return 'https://hono-todos.francois-vidit.workers.dev';
  }
  return '/api';
};

// --- Action ---
export const useContactAction = routeAction$(async (data, event) => {
  const formData = {
    name: String(data.name ?? ''),
    email: String(data.email ?? ''),
    message: String(data.message ?? ''),
  };

  const parsed = safeParse(contactSchema, formData);
  if (!parsed.success) {
    const fieldErrors = parsed.issues.reduce<FieldErrors>((acc, issue: any) => {
      const key = issue.path?.[0]?.key as keyof FieldErrors | undefined;
      const msg = issue.message ?? 'Valeur invalide';
      if (key) {
        (acc[key] ??= []).push(msg);
      } else {
        (acc._form ??= []).push(msg);
      }
      return acc;
    }, {});
    return { error: true, fieldErrors };
  }

  const form: ContactData = parsed.output;

  const res = await fetch(`${getApiBaseUrl()}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });

  if (!res.ok) {
    return { error: true, fieldErrors: { _form: ['Erreur API'] } };
  }

  const json = (await res.json()) as { ok: boolean; id?: string };

  console.log('Réponse API:', json);

  if (!json.ok || !json.id) {
    return { error: true, fieldErrors: { _form: ['Erreur API (pas d’id)'] } };
  }

  throw event.redirect(302, `/contact/${json.id}/success`);
});

// --- Composant ---
export default component$(() => {
  const action = useContactAction();

  return (
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-semibold mb-4 text-center text-blue-700">
        Contactez-nous
      </h1>

      <Form
        action={action}
        class="flex flex-col gap-4 bg-gray-50 shadow rounded-xl p-6"
      >
        {/* Nom */}
        <div>
          {action.value?.fieldErrors?.name?.map((m) => (
            <p key={m} class="text-red-600 text-sm mb-1">
              {m}
            </p>
          ))}
          <label class="block text-sm font-medium text-gray-900">Nom</label>
          <input
            type="text"
            name="name"
            placeholder="Votre nom"
            class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 
                   text-black placeholder-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          {action.value?.fieldErrors?.email?.map((m) => (
            <p key={m} class="text-red-600 text-sm mb-1">
              {m}
            </p>
          ))}
          <label class="block text-sm font-medium text-gray-900">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Votre email"
            class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 
                   text-black placeholder-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div>
          {action.value?.fieldErrors?.message?.map((m) => (
            <p key={m} class="text-red-600 text-sm mb-1">
              {m}
            </p>
          ))}
          <label class="block text-sm font-medium text-gray-900">Message</label>
          <textarea
            name="message"
            placeholder="Votre message"
            class="mt-1 w-full h-32 rounded-md border border-gray-300 px-3 py-2 
                   text-black placeholder-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Erreurs globales */}
        {action.value?.fieldErrors?._form?.map((m) => (
          <p key={m} class="text-red-600 text-sm">
            {m}
          </p>
        ))}

        {/* Bouton */}
        <button
          type="submit"
          disabled={action.isRunning}
          class="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 
                 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {action.isRunning ? 'Envoi en cours…' : 'Envoyer'}
        </button>
      </Form>
    </div>
  );
});
