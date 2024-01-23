import { Mutex } from "async-mutex";
import { db } from "./index.js";

const prefix = "ohno/";
const writeLock = new Mutex();

export async function get(path: string) {
  db.namespace(prefix);

  return await db.get(path).string();
}

export async function put(path: string, value: unknown) {
  const release = await writeLock.acquire();

  try {
    db.namespace(prefix);

    return await db.put(path).value(String(value)).exec();
  } finally {
    release();
  }
}

export async function getJSON<T>(path: string): Promise<T | null> {
  try {
    const rdata = await get(path);

    if (!rdata) return null;

    return JSON.parse(rdata);
  } catch {
    return null;
  }
}

export async function putJSON<T>(path: string, value: T): Promise<boolean> {
  try {
    await put(path, JSON.stringify(value));

    return true;
  } catch {
    return false;
  }
}
