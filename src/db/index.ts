import { Etcd3 } from "etcd3";
import { env } from "../commons/env.js";
import { ConnectionRepository } from "./repositories/connection.js";
import { DictionaryRepository } from "./repositories/dictionary.js";
import { SynthesizerRepository } from "./repositories/synthesizer.js";

export type { Connection, DictionaryEntry, Synthesizer } from "./types.js";

const client = new Etcd3({
  hosts: env.etcdHosts,
});

export const db = {
  synthesizer: new SynthesizerRepository(client),
  dictionary: new DictionaryRepository(client),
  connection: new ConnectionRepository(client),
  close: () => client.close(),
};
