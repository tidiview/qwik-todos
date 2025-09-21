import { readFileSync, writeFileSync } from "fs";

const file = "dist/_worker.js";
let content = readFileSync(file, "utf-8");

content = content.replace(
  /from "server\/entry\.cloudflare-pages"/,
  'from "./server/entry.cloudflare-pages"'
);

writeFileSync(file, content);
console.log("✅ _worker.js corrigé");