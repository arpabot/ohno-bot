import { parse } from "discord-markdown-parser";
import type { SingleASTNode } from "discord-markdown-parser/dist/simple-markdown/index.js";
import { channels, guilds } from "./cache.js";
import type { SpeakableMessage } from "./constructSpeakableMessage.js";
import { getDisplayName } from "./user.js";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  dateStyle: "full",
  timeStyle: "full",
});

type ASTNode = SingleASTNode | SingleASTNode[];

interface CleanContext {
  guildId: string | undefined;
}

interface DiscordUrl {
  guildId: string;
  channelId: string;
  messageId: string | undefined;
}

export default function cleanContent(
  message: SpeakableMessage & { guild_id?: string },
): string {
  const ast = parse(message.content, "extended");
  const ctx: CleanContext = { guildId: message.guild_id };
  const cleaned = astToText(ast, ctx);

  return cleaned.slice(0, 200);
}

function getNodeProp(node: SingleASTNode, key: string): unknown {
  return node[key];
}

function astToText(ast: ASTNode, ctx: CleanContext): string {
  if (Array.isArray(ast)) {
    return ast
      .map((node) => astToText(node, ctx))
      .filter((text) => text.length > 0)
      .join(" ");
  }

  const node = ast;

  switch (node.type) {
    case "link":
    case "blockQuote":
    case "em":
    case "strong":
    case "underline":
    case "strikethrough":
      return astToText(getContent(node), ctx);

    case "text":
    case "escape":
    case "inlineCode":
      return getString(getNodeProp(node, "content"));

    case "url":
    case "autolink": {
      const target = getString(getNodeProp(node, "target"));
      const discordUrl = parseDiscordUrl(target);

      if (!discordUrl) {
        return "URL省略";
      }

      if (ctx.guildId !== discordUrl.guildId) {
        return `外部サーバーの${discordUrl.messageId ? "メッセージ" : "チャンネル"}`;
      }

      const channel = channels.get(discordUrl.channelId);

      if (!channel) {
        return `不明な${discordUrl.messageId ? "メッセージ" : "チャンネル"}`;
      }

      const name = channel.name ?? "不明なチャンネル";

      return discordUrl.messageId ? `${name}のメッセージ` : name;
    }

    case "spoiler":
      return "伏字";

    case "newline":
    case "br":
      return "\n";

    case "codeBlock": {
      const lang = getString(getNodeProp(node, "lang"));

      return lang ? `${lang}のコードブロック` : "コードブロック";
    }

    case "user": {
      const id = getString(getNodeProp(node, "id"));

      return getDisplayName(ctx.guildId ?? "", id);
    }

    case "channel": {
      const id = getString(getNodeProp(node, "id"));
      const channel = channels.get(id);

      return channel?.name ?? "不明なチャンネル";
    }

    case "role": {
      const id = getString(getNodeProp(node, "id"));
      const guild = guilds.get(ctx.guildId ?? "");
      const role = guild?.roles.find((r) => r.id === id);

      return role?.name ?? "不明なロール";
    }

    case "emoji":
      return getString(getNodeProp(node, "name"));

    case "slashCommand": {
      const name = getString(getNodeProp(node, "name"));
      return `${name}コマンド`;
    }

    case "twemoji":
      return getString(getNodeProp(node, "name"));

    case "time": {
      const timestamp = getString(getNodeProp(node, "timestamp"));

      return formatTimestamp(timestamp);
    }

    default:
      return "";
  }
}

function getContent(node: SingleASTNode): ASTNode {
  const content = getNodeProp(node, "content");

  if (Array.isArray(content)) {
    return content.filter(isSingleASTNode);
  }

  if (isSingleASTNode(content)) {
    return content;
  }

  return [];
}

function isSingleASTNode(value: unknown): value is SingleASTNode {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as Record<string, unknown>)["type"] === "string"
  );
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseDiscordUrl(url: string): DiscordUrl | undefined {
  try {
    const { protocol, host, pathname } = new URL(url);

    if (protocol !== "https:") return undefined;

    const hosts = [
      "discord.com",
      "ptb.discord.com",
      "canary.discord.com",
      "discordapp.com",
      "ptb.discordapp.com",
      "canary.discordapp.com",
    ];

    if (!hosts.includes(host)) return undefined;

    const [, channelsPath, guildId, channelId, messageId] = pathname.split("/");

    if (channelsPath !== "channels" || !guildId || !channelId) return undefined;

    return { guildId, channelId, messageId };
  } catch {
    return undefined;
  }
}

function formatTimestamp(timestamp: string): string {
  const date = Number(timestamp) * 1000;
  if (!Number.isInteger(date) || Math.abs(date) > 8640000000000000) {
    return "不明な日付";
  }

  try {
    const segments = getDateSegments(date);
    const nowSegments = getDateSegments(Date.now());

    for (let i = 0; i < segments.length; i++) {
      if (segments[i] !== nowSegments[i]) {
        return segments.slice(i).join("");
      }
    }
    return "今";
  } catch {
    return "不明な日付";
  }
}

function getDateSegments(date: number): string[] {
  const segments = dateFormatter
    .formatToParts(date)
    .reduce<string[]>((acc, { type, value }) => {
      switch (type) {
        case "year":
        case "month":
        case "day":
        case "hour":
        case "minute":
        case "second": {
          const val = Number(value);

          acc.push(Number.isNaN(val) ? value : `${val}`);

          break;
        }

        case "weekday":
        case "literal":
          if (acc.length === 0) {
            acc.push(value);
          } else {
            const lastIdx = acc.length - 1;

            acc[lastIdx] = (acc[lastIdx] ?? "") + value;
          }

          break;
      }

      return acc;
    }, []);

  if (segments.length > 0) {
    const lastIdx = segments.length - 1;

    segments[lastIdx] = (segments[lastIdx] ?? "").trimEnd();
  }

  return segments;
}
