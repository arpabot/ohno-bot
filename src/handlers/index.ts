import { GatewayDispatchEvents, WithIntrinsicProps } from "@discordjs/core";
import guildCreate from "./guildCreate.js";
import guildMemberUpdate from "./guildMemberUpdate.js";
import guildMembersChunk from "./guildMembersChunk.js";
import interactionCreate from "./interactionCreate.js";
import messageCreate from "./messageCreate.js";
import ready from "./ready.js";
import userUpdate from "./userUpdate.js";
import voiceServerUpdate from "./voiceServerUpdate.js";
import voiceStateUpdate from "./voiceStateUpdate.js";

const handlers: {
  // fuck.
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key in GatewayDispatchEvents]?: (a: WithIntrinsicProps<any>) => unknown;
} = {
  [GatewayDispatchEvents.Ready]: ready,
  [GatewayDispatchEvents.InteractionCreate]: interactionCreate,
  [GatewayDispatchEvents.GuildMemberUpdate]: guildMemberUpdate,
  [GatewayDispatchEvents.GuildMembersChunk]: guildMembersChunk,
  [GatewayDispatchEvents.UserUpdate]: userUpdate,
  [GatewayDispatchEvents.VoiceStateUpdate]: voiceStateUpdate,
  [GatewayDispatchEvents.VoiceServerUpdate]: voiceServerUpdate,
  [GatewayDispatchEvents.GuildCreate]: guildCreate,
  [GatewayDispatchEvents.MessageCreate]: messageCreate,
};

export default handlers;
