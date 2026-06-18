/**
 * Create or upgrade a field officer account.
 * Usage: npm run db:create-field-officer
 */
import "dotenv/config";

import bcrypt from "bcryptjs";

import { connectDB, disconnectDB } from "../src/lib/db.server";
import { User } from "../src/lib/models/user.model.server";

async function createFieldOfficer() {
  const email = (process.env.FIELD_EMAIL ?? "field@henhouse.ng").toLowerCase();
  const password = process.env.FIELD_PASSWORD ?? "ChangeMeField123!";
  const fullName = process.env.FIELD_NAME ?? "Field Officer";

  if (password.length < 8) {
    console.error("FIELD_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "field_officer";
    existing.kycStatus = "verified";
    existing.fullName = fullName;
    if (process.env.FIELD_PASSWORD) {
      existing.passwordHash = await bcrypt.hash(password, 12);
    }
    await existing.save();
    console.log(`Updated existing user to field_officer: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      passwordHash,
      fullName,
      role: "field_officer",
      kycStatus: "verified",
    });
    console.log(`Created field_officer: ${email}`);
  }

  if (!process.env.FIELD_PASSWORD) {
    console.log("\nDefault password: ChangeMeField123!");
    console.log("Sign in at /auth/sign-in — you'll be redirected to /field\n");
  }

  await disconnectDB();
}

createFieldOfficer().catch((err) => {
  console.error(err);
  process.exit(1);
});
