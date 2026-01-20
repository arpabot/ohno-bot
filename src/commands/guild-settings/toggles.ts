import {
  createToggleHandler,
  createToggleSubcommand,
  type SettingKey,
  settingLabels,
} from "./shared.js";

const toggleDefinitions: ToggleDefinition[] = [
  {
    name: "join-leave",
    description: "入退室アナウンスの ON/OFF を切り替えます",
    settingKey: "announceJoinLeave",
  },
  {
    name: "move",
    description: "チャンネル移動アナウンスの ON/OFF を切り替えます",
    settingKey: "announceMove",
  },
  {
    name: "screen-share",
    description: "画面共有アナウンスの ON/OFF を切り替えます",
    settingKey: "announceScreenShare",
  },
  {
    name: "camera",
    description: "カメラ ON/OFF アナウンスの ON/OFF を切り替えます",
    settingKey: "announceCamera",
  },
  {
    name: "mute",
    description: "ミュートアナウンスの ON/OFF を切り替えます",
    settingKey: "announceMute",
  },
  {
    name: "deafen",
    description: "スピーカーミュートアナウンスの ON/OFF を切り替えます",
    settingKey: "announceDeafen",
  },
  {
    name: "bot-messages",
    description: "Bot メッセージ読み上げの ON/OFF を切り替えます",
    settingKey: "readBotMessages",
  },
  {
    name: "stickers",
    description: "スタンプ名読み上げの ON/OFF を切り替えます",
    settingKey: "readStickers",
  },
  {
    name: "attachments",
    description: "添付ファイル種別読み上げの ON/OFF を切り替えます",
    settingKey: "readAttachments",
  },
  {
    name: "urls",
    description: "URL 省略アナウンスの ON/OFF を切り替えます",
    settingKey: "readUrls",
  },
];

interface ToggleDefinition {
  name: string;
  description: string;
  settingKey: SettingKey;
}

export const { subcommands: toggleSubcommands, handlers: toggleHandlers } =
  createToggles();

function createToggles() {
  const subcommands: Record<
    string,
    ReturnType<typeof createToggleSubcommand>
  > = {};
  const handlers: Record<string, ReturnType<typeof createToggleHandler>> = {};

  for (const def of toggleDefinitions) {
    const label = settingLabels[def.settingKey];

    subcommands[def.name] = createToggleSubcommand(def);
    handlers[def.name] = createToggleHandler({ ...def, label });
  }

  return { subcommands, handlers };
}
