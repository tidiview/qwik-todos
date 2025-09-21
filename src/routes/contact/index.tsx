import { component$ } from '@builder.io/qwik';
import { routeAction$, Form } from '@builder.io/qwik-city';
import { createClient, ResultSet } from '@libsql/client/web';
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

// --- Action ---
export const useContactAction = routeAction$(async (data, event) => {
  // ⚡ Cast explicite → évite undefined
  const formData = {
    name: String(data.name ?? ''),
    email: String(data.email ?? ''),
    message: String(data.message ?? ''),
  };

  // ✅ Validation Valibot
  const parsed = safeParse(contactSchema, formData);
  if (!parsed.success) {
    // On transforme les issues en dictionnaire { champ: [messages...] }
    const fieldErrors = parsed.issues.reduce<Record<string, string[]>>((acc, issue: any) => {
      const key = issue.path?.[0]?.key as string | undefined;
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

  // ✅ Insertion Turso
  const client = createClient({
    url: event.env.get('TURSO_DATABASE_URL')!,
    authToken: event.env.get('TURSO_AUTH_TOKEN')!,
  });

  const result: ResultSet = await client.execute(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [form.name, form.email, form.message]
  );

if (!result.lastInsertRowid) {
  throw new Error('Insertion échouée');
}

const id = String(result.lastInsertRowid);
throw event.redirect(302, `/contact/${id}/success`);
});

// --- Composant ---
export default component$(() => {
  const action = useContactAction();

  return (
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-semibold mb-4 text-center text-blue-700">
        Contactez-nous
      </h1>

      {/* Bloc blanc comme dans success */}
      <Form action={action} class="flex flex-col gap-4 bg-white shadow rounded-xl p-6">
        {/* Nom */}
        <div>
          {action.value?.fieldErrors?.name?.map((m: string) => (
            <p key={m} class="text-red-600 text-sm mb-1">{m}</p>
          ))}
          <label class="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            name="name"
            placeholder="Votre nom"
            class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          {action.value?.fieldErrors?.email?.map((m: string) => (
            <p key={m} class="text-red-600 text-sm mb-1">{m}</p>
          ))}
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Votre email"
            class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div>
          {action.value?.fieldErrors?.message?.map((m: string) => (
            <p key={m} class="text-red-600 text-sm mb-1">{m}</p>
          ))}
          <label class="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            name="message"
            placeholder="Votre message"
            class="mt-1 w-full h-32 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Erreurs globales */}
        {action.value?.fieldErrors?._form?.map((m: string) => (
          <p key={m} class="text-red-600 text-sm">{m}</p>
        ))}

        {/* Bouton */}
        <button
          type="submit"
          disabled={action.isRunning}
          class="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {action.isRunning ? 'Envoi en cours…' : 'Envoyer'}
        </button>
      </Form>
    </div>
  );
});
