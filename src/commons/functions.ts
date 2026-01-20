export async function catchAll(promises: Promise<unknown>[]): Promise<void> {
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Promise rejected:", result.reason);
    }
  }
}
