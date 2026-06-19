import { createServerFn } from "@tanstack/react-start";

import { requireAdminSession } from "@/lib/api/admin-session";

export const listStaffFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");
  const { formatNgPhoneDisplay } = await import("@/lib/phone");

  await connectDB();
  const users = await User.find({
    role: { $in: ["field_officer", "admin", "super_admin"] },
  })
    .sort({ role: 1, fullName: 1 })
    .lean();

  return users.map((user) => ({
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ? formatNgPhoneDisplay(user.phone) : undefined,
    role: user.role,
    createdAt: user.createdAt?.toISOString() ?? "",
  }));
});
