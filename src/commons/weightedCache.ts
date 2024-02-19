export default class WeightedCache<K, V> {
  constructor(
    public max: number,
    private inner: Inner<K, V>[] = [],
  ) {}

  /**
   * @returns Returns a boolean value of whether the old element has been deleted
   */
  set(key: K, value: V): boolean {
    const sorted = this.inner.sort((a, b) => b.weight - a.weight);
    const index = this.inner.findIndex((x) => x.key === key);
    let deleted = false;

    if (index === -1 && this.inner.length >= this.max) {
      const lastIndex = this.inner.findIndex(
        (x) => x.key === sorted.at(-1)?.key,
      );

      this.inner.splice(lastIndex, 1);

      deleted = true;
    }

    if (index !== -1) {
      const old = this.inner[index];

      if (old) {
        old.weight++;
        old.value = value;
      }
    } else {
      this.inner.push({ weight: 0, key, value });
    }

    return deleted;
  }

  get(key: K): V | undefined {
    const inner = this.inner[this.inner.findIndex((x) => x.key === key)];

    if (inner) {
      inner.weight++;
    }

    return inner?.value;
  }

  has(key: K): boolean {
    return this.inner.some((x) => x.key === key);
  }
}

interface Inner<K, V> {
  weight: number;
  key: K;
  value: V;
}
