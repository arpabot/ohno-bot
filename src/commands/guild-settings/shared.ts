import {
  SlashCommandBooleanOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import {
  db,
  type GuildSettings,
  getDefaultGuildSettings,
} from "../../db/index.js";
import {
  getRequiredOption,
  type ISubcommandHandler,
  replySuccess,
  type SubcommandContext,
} from "../base.js";

export const settingKeys = [
  "announceJoinLeave",
  "announceMove",
  "announceScreenShare",
  "announceCamera",
  "announceMute",
  "announceDeafen",
  "readBotMessages",
  "readStickers",
  "readAttachments",
  "readUrls",
] as const;

export const settingLabels: Record<SettingKey, string> = {
  announceJoinLeave: "入退室",
  announceMove: "チャンネル移動",
  announceScreenShare: "画面共有",
  announceCamera: "カメラ ON/OFF",
  announceMute: "ミュート",
  announceDeafen: "スピーカーミュート",
  readBotMessages: "Bot メッセージ読み上げ",
  readStickers: "スタンプ名読み上げ",
  readAttachments: "添付ファイル種別",
  readUrls: "URL省略アナウンス",
};

export type SettingKey = (typeof settingKeys)[number];

interface ToggleSubcommandOptions {
  name: string;
  description: string;
  settingKey: SettingKey;
  label: string;
}

export async function getGuildSettings(
  guildId: string,
): Promise<GuildSettings> {
  const existing = await db.guildSettings.findByGuildId(guildId);

  return existing ?? getDefaultGuildSettings(guildId);
}

export function createToggleSubcommand(
  options: ToggleSubcommandOptions,
): SlashCommandSubcommandBuilder {
  return new SlashCommandSubcommandBuilder()
    .setName(options.name)
    .setDescription(options.description)
    .addBooleanOption(
      new SlashCommandBooleanOption()
        .setName("enabled")
        .setDescription("有効にするかどうか")
        .setRequired(true),
    );
}

export function createToggleHandler(
  options: ToggleSubcommandOptions,
): ISubcommandHandler {
  return {
    async run(ctx: SubcommandContext): Promise<unknown> {
      const guildId = ctx.interaction.guild_id;
      const settings = await getGuildSettings(guildId);
      const oldValue = settings[options.settingKey];
      const newValue = getRequiredOption<boolean>(ctx.options, "enabled");
      settings[options.settingKey] = newValue;

      await db.guildSettings.upsert(settings);

      return replySuccess(
        ctx,
        "設定を変更しました",
        `${options.label} を ${oldValue ? "ON" : "OFF"} から ${newValue ? "ON" : "OFF"} に変更しました`,
      );
    },
  };
}
