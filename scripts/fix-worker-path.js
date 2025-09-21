// scripts/fix-worker-path.js
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const serverEntry = join(process.cwd(), "dist", "server", "entry.cloudflare-pages.js");
const workerFile = join(process.cwd(), "dist", "_worker.js");

if (!existsSync(serverEntry)) {
  console.error("❌ introuvable:", serverEntry);
  process.exit(1);
}

// On force un _worker.js minimal et correct
const content = `import { fetch } from "./server/entry.cloudflare-pages";
export default { fetch };
`;

writeFileSync(workerFile, content, "utf8");
console.log("✅ _worker.js réécrit avec import relatif ./server/entry.cloudflare-pages");
