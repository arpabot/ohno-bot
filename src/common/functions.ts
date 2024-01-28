export function except<T, T2>(value: T): T2 {
  if (!value) {
    console.log(`Fuck: ${value}`);
    process.exit();
  }

  return value as unknown as T2;
}
