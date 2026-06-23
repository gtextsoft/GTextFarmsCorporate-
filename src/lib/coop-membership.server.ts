import { connectDB } from "@/lib/db.server";
import { formatMembershipNumber, getCoopMembershipStart } from "@/lib/coop-membership";
import { MembershipCounter } from "@/lib/models/membership-counter.model.server";

export async function assignNextMembershipNumber(): Promise<string> {
  await connectDB();
  const start = getCoopMembershipStart();

  await MembershipCounter.updateOne(
    { key: "coop" },
    { $setOnInsert: { lastNumber: start - 1 } },
    { upsert: true },
  );

  const counter = await MembershipCounter.findOneAndUpdate(
    { key: "coop" },
    { $inc: { lastNumber: 1 } },
    { new: true },
  );

  if (!counter) {
    throw new Error("Failed to assign membership number");
  }

  return formatMembershipNumber(counter.lastNumber);
}
