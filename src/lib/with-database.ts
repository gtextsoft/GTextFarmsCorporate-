export async function withDatabase<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    const { connectDB } = await import("@/lib/db.server");
    await connectDB();
    return await operation();
  } catch (err) {
    console.error("[withDatabase]", err);
    return fallback;
  }
}
