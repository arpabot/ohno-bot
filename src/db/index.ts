import { Etcd3 } from "etcd3";
import { env } from "../commons/env.js";
import { ConnectionRepository } from "./repositories/connection.js";
import { DictionaryRepository } from "./repositories/dictionary.js";
import { GuildSettingsRepository } from "./repositories/guildSettings.js";
import { SynthesizerRepository } from "./repositories/synthesizer.js";

const client = new Etcd3({
  hosts: env.etcdHosts,
});

export { getDefaultGuildSettings } from "./repositories/guildSettings.js";

export type {
  Connection,
  DictionaryEntry,
  GuildSettings,
  Synthesizer,
} from "./types.js";

export const db = {
  synthesizer: new SynthesizerRepository(client),
  dictionary: new DictionaryRepository(client),
  connection: new ConnectionRepository(client),
  guildSettings: new GuildSettingsRepository(client),
  close: () => client.close(),
};
