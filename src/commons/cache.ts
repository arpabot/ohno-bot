import type {
  APIChannel,
  APIGuild,
  APIGuildMember,
  APIUser,
  APIVoiceState,
} from "@discordjs/core";
import type { NonNullableByKey } from "./types.js";

interface Inner<K, V> {
  weight: number;
  key: K;
  value: V;
}

type MemberValue = NonNullableByKey<APIGuildMember, "user", APIUser> & {
  guild_id: string;
};

export class RingCache<K, V> {
  constructor(
    public max: number,
    private inner: [K, V][] = [],
  ) {}

  set(key: K, value: V): boolean {
    const index = this.inner.findIndex(([k]) => k === key);
    let deleted = false;

    if (index === -1 && this.inner.length >= this.max) {
      this.inner.shift();

      deleted = true;
    }

    if (index !== -1) {
      this.inner[index] = [key, value];
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

  delete(key: K): boolean {
    const index = this.inner.findIndex((x) => x[0] === key);

    if (index === -1) {
      return false;
    }

    this.inner.splice(index, 1);

    return true;
  }
}

export class WeightedCache<K, V> {
  constructor(
    public max: number,
    private inner: Inner<K, V>[] = [],
  ) {}

  set(key: K, value: V): boolean {
    const index = this.inner.findIndex((x) => x.key === key);
    let deleted = false;

    if (index === -1 && this.inner.length >= this.max) {
      const minElement = this.inner.reduce((min, curr) =>
        curr.weight < min.weight ? curr : min,
      );
      const minIndex = this.inner.findIndex((x) => x.key === minElement.key);

      this.inner.splice(minIndex, 1);

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
    const inner = this.inner.find((x) => x.key === key);

    if (inner) {
      inner.weight++;
    }

    return inner?.value;
  }

  has(key: K): boolean {
    return this.inner.some((x) => x.key === key);
  }
}

class MemberCache {
  private inner: WeightedCache<string, MemberValue>;

  constructor(max: number) {
    this.inner = new WeightedCache(max);
  }

  set(guildId: string, memberId: string, value: MemberValue): boolean {
    return this.inner.set(`${guildId}:${memberId}`, value);
  }

  get(guildId: string, memberId: string): MemberValue | undefined {
    return this.inner.get(`${guildId}:${memberId}`);
  }

  has(guildId: string, memberId: string): boolean {
    return this.inner.has(`${guildId}:${memberId}`);
  }
}

export const users = new WeightedCache<string, APIUser>(10000);
export const members = new MemberCache(10000);
export const channels = new RingCache<string, APIChannel>(1000);
export const voiceStates = new RingCache<string, APIVoiceState[]>(100);
export const guilds = new RingCache<string, APIGuild>(100);
