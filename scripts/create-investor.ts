/**
 * Create or upgrade a test investor account (KYC verified).
 * Usage: npm run db:create-investor
 *
 * Optional env overrides:
 *   INVESTOR_EMAIL=investor@gtextfarms.ng
 *   INVESTOR_PASSWORD=your-secure-password
 *   INVESTOR_NAME="Demo Investor"
 *   INVESTOR_WALLET_BALANCE=500000
 */
import "dotenv/config";

import bcrypt from "bcryptjs";

import { connectDB, disconnectDB } from "../src/lib/db.server";
import { User } from "../src/lib/models/user.model.server";

async function createInvestor() {
  const email = (process.env.INVESTOR_EMAIL ?? "investor@gtextfarms.ng").toLowerCase();
  const password = process.env.INVESTOR_PASSWORD ?? "ChangeMeInvestor123!";
  const fullName = process.env.INVESTOR_NAME ?? "Demo Investor";
  const walletBalance = Number(process.env.INVESTOR_WALLET_BALANCE ?? 0);

  if (password.length < 8) {
    console.error("INVESTOR_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await connectDB();

  const existing = await User.findOne({ email });
  let userId: string;

  if (existing) {
    existing.role = "investor";
    existing.kycStatus = "verified";
    existing.fullName = fullName;
    if (process.env.INVESTOR_PASSWORD) {
      existing.passwordHash = await bcrypt.hash(password, 12);
    }
    await existing.save();
    userId = existing._id.toString();
    console.log(`Updated existing investor: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      passwordHash,
      fullName,
      role: "investor",
      kycStatus: "verified",
      phone: "+2348000000001",
    });
    userId = user._id.toString();
    console.log(`Created investor: ${email}`);
  }

  if (walletBalance > 0) {
    const { getOrCreateWallet } = await import("../src/lib/wallet.server");
    const wallet = await getOrCreateWallet(userId);
    wallet.balance = walletBalance;
    await wallet.save();
    console.log(`Wallet balance set to ₦${walletBalance.toLocaleString()}`);
  }

  console.log("\n--- Investor login ---");
  console.log(`URL:      /auth/sign-in`);
  console.log(`Email:    ${email}`);
  if (!process.env.INVESTOR_PASSWORD) {
    console.log(`Password: ${password}`);
  }
  console.log(`Portal:   /app`);
  console.log(`KYC:      verified (can invest immediately)\n`);

  await disconnectDB();
}

createInvestor().catch((err) => {
  console.error(err);
  process.exit(1);
});
