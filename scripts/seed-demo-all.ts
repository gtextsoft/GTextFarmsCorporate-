/**
 * Full demo dataset for client walkthroughs — admin, investor, and field portals.
 *
 * Usage: npm run db:demo
 *
 * Creates admin + field officer + seeds all content and operational demo data.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log("=== GText Farms demo setup ===\n");

  await run("npm", ["run", "db:create-admin"]);
  await run("npm", ["run", "db:create-field-officer"]);

  process.env.INVESTOR_WALLET_BALANCE = process.env.INVESTOR_WALLET_BALANCE ?? "850000";
  await run("npm", ["run", "db:create-investor"]);

  await run("npm", ["run", "db:seed"]);

  console.log("\n=== Demo ready ===");
  console.log("Admin:    /auth/sign-in  →  admin@gtextfarms.ng (or your ADMIN_EMAIL)");
  console.log("Investor: /auth/sign-in  →  investor@gtextfarms.ng");
  console.log("Field:    /auth/sign-in  →  field@gtextfarms.ng");
  console.log("Dashboard /admin should show KYC, withdrawals, reports, leads, and funding bars.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
