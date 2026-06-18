export async function requireAdminSession() {
  const { useAppSession } = await import("@/lib/session.server");
  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");

  const session = await useAppSession();
  if (!session.data.userId) {
    return { error: "Unauthorized" as const };
  }

  await connectDB();
  const admin = await User.findById(session.data.userId);
  if (!admin || (admin.role !== "admin" && admin.role !== "super_admin")) {
    return { error: "Forbidden" as const };
  }

  return { admin, session };
}
