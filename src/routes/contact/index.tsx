import { component$ } from '@builder.io/qwik';
import { routeAction$, Form } from '@builder.io/qwik-city';
import { createClient } from '@libsql/client/web';

export const useContactAction = routeAction$(async (data, event) => {
  const client = createClient({
    url: event.env.get('TURSO_DATABASE_URL')!,
    authToken: event.env.get('TURSO_AUTH_TOKEN')!,
  });

  const name = String(data.name ?? '');
  const email = String(data.email ?? '');
  const message = String(data.message ?? '');

  await client.execute(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [name, email, message]
  );

// ✅ redirection avec chemin relatif
 throw event.redirect(302, '/contact/success/');
});


export default component$(() => {
  const action = useContactAction();

  return (
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-semibold mb-4">Contactez-nous</h1>

      <Form action={action} class="flex flex-col gap-3">
        <input type="text" name="name" placeholder="Votre nom" required />
        <input type="email" name="email" placeholder="Votre email" required />
        <textarea name="message" placeholder="Votre message" required />
        <button type="submit" disabled={action.isRunning}>
          {action.isRunning ? 'Envoi en cours…' : 'Envoyer'}
        </button>
      </Form>
    </div>
  );
});
