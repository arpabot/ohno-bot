export function except<T, T2>(value: T): T2 {
  if (!value) {
    console.log(`Fuck: ${value}`);
  }

  return value as unknown as T2;
}
