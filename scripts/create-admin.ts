/**
 * Create the first admin user.
 * Usage: npm run db:create-admin
 *
 * Optional env overrides:
 *   ADMIN_EMAIL=admin@gtextfarms.ng
 *   ADMIN_PASSWORD=your-secure-password
 *   ADMIN_NAME="Henhouse Admin"
 */
import "dotenv/config";

import bcrypt from "bcryptjs";

import { connectDB, disconnectDB } from "../src/lib/db.server";
import { User } from "../src/lib/models/user.model.server";

async function createAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@gtextfarms.ng").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMeAdmin123!";
  const fullName = process.env.ADMIN_NAME ?? "GText Farms Admin";

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "super_admin";
    existing.kycStatus = "verified";
    existing.fullName = fullName;
    if (password && process.env.ADMIN_PASSWORD) {
      existing.passwordHash = await bcrypt.hash(password, 12);
    }
    await existing.save();
    console.log(`Updated existing user to super_admin: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      passwordHash,
      fullName,
      role: "super_admin",
      kycStatus: "verified",
    });
    console.log(`Created super_admin: ${email}`);
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.log("\n--- Admin login ---");
    console.log(`URL:      /auth/sign-in`);
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Portal:   /admin\n`);
  }

  await disconnectDB();
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
