export function expect<T, T2>(value: T): T2 {
  if (!value) {
    console.log(`Fuck: ${value}`);
    process.exit();
  }

  return value as unknown as T2;
}

export function transmute<T>(x: unknown): x is T {
  return x != null;
}

export async function __catch(promises: Promise<unknown>[]): Promise<void> {
  try {
    await Promise.all(promises);
  } catch {}
}
