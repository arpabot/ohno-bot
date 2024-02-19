export default class RingCache<K, V> {
  constructor(
    public max: number,
    private inner: [K, V][] = [],
  ) {}

  /**
   * @returns Returns a boolean value of whether the old element has been deleted
   */
  set(key: K, value: V): boolean {
    const has = this.has(key);
    let deleted = false;

    if (!has && this.inner.length >= this.max) {
      this.inner.shift();
      deleted = true;
    }

    if (has) {
      const i = this.inner.findIndex((k) => k === key);

      this.inner[i] = [key, value];
    } else {
      this.inner.push([key, value]);
    }

    return deleted;
  }

  get(key: K): V | undefined {
    return this.inner.find((x) => x[0] === key)?.[1];
  }

  has(key: K): boolean {
    return this.inner.some((x) => x[0] === key);
  }
}
