export async function requireFieldOfficerSession() {
  const { useAppSession } = await import("@/lib/session.server");
  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");

  const session = await useAppSession();
  if (!session.data.userId) {
    return { error: "Unauthorized" as const };
  }

  await connectDB();
  const user = await User.findById(session.data.userId);
  if (
    !user ||
    (user.role !== "field_officer" && user.role !== "admin" && user.role !== "super_admin")
  ) {
    return { error: "Forbidden" as const };
  }

  return { user, session };
}
