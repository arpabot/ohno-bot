import {
  createToggleHandler,
  createToggleSubcommand,
  type SettingKey,
} from "./shared.js";

const toggleDefinitions: ToggleDefinition[] = [
  {
    name: "join-leave",
    description: "入退室アナウンスの ON/OFF を切り替えます",
    settingKey: "announceJoinLeave",
    label: "入退室",
  },
  {
    name: "move",
    description: "チャンネル移動アナウンスの ON/OFF を切り替えます",
    settingKey: "announceMove",
    label: "チャンネル移動",
  },
  {
    name: "screen-share",
    description: "画面共有アナウンスの ON/OFF を切り替えます",
    settingKey: "announceScreenShare",
    label: "画面共有",
  },
  {
    name: "camera",
    description: "カメラ ON/OFF アナウンスの ON/OFF を切り替えます",
    settingKey: "announceCamera",
    label: "カメラ ON/OFF",
  },
  {
    name: "mute",
    description: "ミュートアナウンスの ON/OFF を切り替えます",
    settingKey: "announceMute",
    label: "ミュート",
  },
  {
    name: "deafen",
    description: "スピーカーミュートアナウンスの ON/OFF を切り替えます",
    settingKey: "announceDeafen",
    label: "スピーカーミュート",
  },
  {
    name: "bot-messages",
    description: "Bot メッセージ読み上げの ON/OFF を切り替えます",
    settingKey: "readBotMessages",
    label: "Bot メッセージ読み上げ",
  },
  {
    name: "stickers",
    description: "スタンプ名読み上げの ON/OFF を切り替えます",
    settingKey: "readStickers",
    label: "スタンプ名読み上げ",
  },
  {
    name: "attachments",
    description: "添付ファイル種別読み上げの ON/OFF を切り替えます",
    settingKey: "readAttachments",
    label: "添付ファイル種別",
  },
  {
    name: "urls",
    description: "URL 省略アナウンスの ON/OFF を切り替えます",
    settingKey: "readUrls",
    label: "URL 省略アナウンス",
  },
];

interface ToggleDefinition {
  name: string;
  description: string;
  settingKey: SettingKey;
  label: string;
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
    subcommands[def.name] = createToggleSubcommand(def);
    handlers[def.name] = createToggleHandler(def);
  }

  return { subcommands, handlers };
}
