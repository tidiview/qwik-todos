import { component$ } from "@builder.io/qwik";
import {
  type DocumentHead,
  routeLoader$,
  routeAction$,
  zod$,
  z,
  Form,
} from "@builder.io/qwik-city";
import { getDb } from "~/lib/db";
import { readTursoEnv } from "~/lib/env";
import styles from "./todolist.module.css";

// --- Types ---
type ListItem = {
  id: number;
  text: string;
};

// --- Loader ---
export const useListLoader = routeLoader$(async ({ platform }) => {
  const db = await getDb(readTursoEnv(platform));
  const res = await db.execute("SELECT id, text FROM todos ORDER BY id DESC");

  // typer correctement row
  const todos: ListItem[] = res.rows.map((row: Record<string, unknown>) => ({
    id: Number(row.id),
    text: String(row.text),
  }));

  return todos;
});

// --- Action ---
export const useAddToListAction = routeAction$(
  async (data, { platform }) => {
    const db = await getDb(readTursoEnv(platform));
    await db.execute({
      sql: "INSERT INTO todos (text) VALUES (?)",
      args: [data.text],
    });
    return { success: true };
  },
  zod$({
    text: z.string().trim().min(1),
  }),
);

// --- Component ---
export default component$(() => {
  const list = useListLoader();
  const action = useAddToListAction();

  return (
    <>
      <div class="container container-center">
        <h1>
          <span class="highlight">TODO</span> List
        </h1>
      </div>

      <div role="presentation" class="ellipsis"></div>

      <div class="container container-center">
        {list.value.length === 0 ? (
          <span class={styles.empty}>No items found</span>
        ) : (
          <ul class={styles.list}>
            {list.value.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        )}
      </div>

      <div class="container container-center">
        <Form action={action} spaReset>
          <input type="text" name="text" required class={styles.input} />{" "}
          <button type="submit" class="button-dark">
            Add item
          </button>
        </Form>

        <p class={styles.hint}>
          PS: This little app works even when JavaScript is disabled.
        </p>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Qwik Todo List",
};
