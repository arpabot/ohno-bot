import { APIMessage } from "@discordjs/core";
import { channels, members, users } from "./cache.js";
import { transmute } from "./functions.js";

const uriPattern =
  /(?<scheme>[a-zA-Z]([a-zA-Z0-9+.-])*):(?<hier_part>\/\/((?<userinfo>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:)*@)?(?<host>\[(?<ipv6address>(((?<h16_0>([0-9a-fA-F]{1,4})):){6}(?<ls32_0>((?<h16_1>([0-9a-fA-F]{1,4})):(?<h16_2>([0-9a-fA-F]{1,4}))|(?<ipv4address_0>((?<dec_octet_0>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_1>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_2>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_3>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|::((?<h16_3>([0-9a-fA-F]{1,4})):){5}(?<ls32_1>((?<h16_4>([0-9a-fA-F]{1,4})):(?<h16_5>([0-9a-fA-F]{1,4}))|(?<ipv4address_1>((?<dec_octet_4>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_5>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_6>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_7>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|((?<h16_6>([0-9a-fA-F]{1,4})))?::((?<h16_7>([0-9a-fA-F]{1,4})):){4}(?<ls32_2>((?<h16_8>([0-9a-fA-F]{1,4})):(?<h16_9>([0-9a-fA-F]{1,4}))|(?<ipv4address_2>((?<dec_octet_8>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_9>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_10>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_11>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_10>([0-9a-fA-F]{1,4})):){0,1}(?<h16_11>([0-9a-fA-F]{1,4})))?::((?<h16_12>([0-9a-fA-F]{1,4})):){3}(?<ls32_3>((?<h16_13>([0-9a-fA-F]{1,4})):(?<h16_14>([0-9a-fA-F]{1,4}))|(?<ipv4address_3>((?<dec_octet_12>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_13>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_14>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_15>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_15>([0-9a-fA-F]{1,4})):){0,2}(?<h16_16>([0-9a-fA-F]{1,4})))?::((?<h16_17>([0-9a-fA-F]{1,4})):){2}(?<ls32_4>((?<h16_18>([0-9a-fA-F]{1,4})):(?<h16_19>([0-9a-fA-F]{1,4}))|(?<ipv4address_4>((?<dec_octet_16>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_17>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_18>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_19>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_20>([0-9a-fA-F]{1,4})):){0,3}(?<h16_21>([0-9a-fA-F]{1,4})))?::(?<h16_22>([0-9a-fA-F]{1,4})):(?<ls32_5>((?<h16_23>([0-9a-fA-F]{1,4})):(?<h16_24>([0-9a-fA-F]{1,4}))|(?<ipv4address_5>((?<dec_octet_20>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_21>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_22>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_23>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_25>([0-9a-fA-F]{1,4})):){0,4}(?<h16_26>([0-9a-fA-F]{1,4})))?::(?<ls32_6>((?<h16_27>([0-9a-fA-F]{1,4})):(?<h16_28>([0-9a-fA-F]{1,4}))|(?<ipv4address_6>((?<dec_octet_24>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_25>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_26>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_27>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_29>([0-9a-fA-F]{1,4})):){0,5}(?<h16_30>([0-9a-fA-F]{1,4})))?::(?<h16_31>([0-9a-fA-F]{1,4}))|(((?<h16_32>([0-9a-fA-F]{1,4})):){0,6}(?<h16_33>([0-9a-fA-F]{1,4})))?::))\]|(?<ipv4address_7>((?<dec_octet_28>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_29>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_30>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_31>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))|(?<reg_name>([a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=])*))(:(?<port>[0-9]*))?(?<path>(?<path_abempty>(\/(?<segment_path_abempty>((?<pchar_segment_path_abempty>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))*))*)|(?<path_absolute>(\/(?<segment_nz_path_absolute>((?<pchar_segment_nz_path_absolute>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))+)(\/(?<segment_path_absolute>((?<pchar_segment_path_absolute>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))*))+?))|(?<path_noscheme>((?<segment_nz_nc_path_noscheme>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|@)(\/(?<segment_path_noscheme>((?<pchar_segment_path_noscheme>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))*))*))|(?<path_rootless>((?<segment_nz_path_rootless>((?<pchar_segment_nz_path_rootless>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))+)(\/(?<segment_path_rootless>((?<pchar_segment_path_rootless>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))*))*))|(?:)))(\?(?<query>((?<pchar_query>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@)|\/|\?)*))?(#(?<fragment>((?<pchar_fragment>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@)|\/|\?)*))?/g;
const userPattern = /<@!?(?<id>\d{17,19})>/g;
const channelPattern = /<#(?<id>\d{17,19})>/g;
const rolePattern = /<@&(?<id>\d{17,19})>/g;
const commandPattern = /<\/(?<name>.+):(?<id>\d{17,19})>/g;
const customEmojiPattern = /<a?:(?<name>[a-zA-Z_0-9]+):(?<id>\d{17,19})>/g;
const timestampPattern = /<t:(?<timestamp>\d+)(:(?<style>.))?>/g;
const discordPattern =
  /https?:\/\/(www\.)?((canary|ptb)\.)?discord(app)?\.com\/channels\/(?<guildId>\d{17,19})\/(?<channelId>\d{17,19})(\/(?<messageId>\d{17,19}))?/g;
const hyperLinkPattern = new RegExp(
  `\\[(?<name>[^\\[\\]]+)\\]\\(<?${uriPattern.source}>?\\)`,
  "g",
);
const codeBlockPattern = /```(?<name>[a-zA-Z0-9]+)?((?!```)(.|\n))+```/g;
const spoilerPattern = /\|\|[^|]+\|\|/g;

export default function cleanContent(
  message: APIMessage & { guild_id?: string },
): string {
  return message.content
    .replaceAll(
      codeBlockPattern,
      generateReplacer(({ name }) => `${name}のコードブロック`, "", ""),
    )
    .replaceAll(spoilerPattern, "スポイラー")
    .replaceAll(
      hyperLinkPattern,
      generateReplacer(({ name }) => `${name} カッコ ハイパーリンク`, "", ""),
    )
    .replaceAll(discordPattern, (...args: unknown[]) => {
      const groups = args.at(-1);

      if (
        !transmute<{ guildId: string; channelId: string; messageId?: string }>(
          groups,
        )
      )
        return "";

      const channel = channels.get(groups.channelId);
      const channelName = channel ? `#${channel.name}` : "不明なチャンネル";

      return message.guild_id === groups.guildId
        ? groups.messageId
          ? `${channelName}のメッセージ`
          : channelName
        : groups.messageId
          ? "外部サーバーのメッセージ"
          : "外部サーバーのチャンネル";
    })
    .replaceAll(uriPattern, (...args: unknown[]) => {
      const groups = args.at(-1);

      if (!transmute<UriPatternGroup>(groups)) return "";

      if (groups.scheme !== "https" && groups.scheme !== "http")
        return `${groups.scheme}へのリンク`;

      if (groups.ipv6address) return "IPv6 アドレスへのリンク";

      return `${groups.host.replace(/^www\./, "")}のリンク`;
    })
    .replaceAll(
      userPattern,
      generateReplacer(({ id }) => {
        const member = members.get(message.guild_id || "", id);

        if (member?.nick) return member.nick;

        const user = users.get(id);

        return user?.global_name || user?.username;
      }, "不明なユーザー"),
    )
    .replaceAll(
      channelPattern,
      generateReplacer(({ id }) => {
        const channel = channels.get(id);
        return channel?.name;
      }, "不明なチャンネル"),
    )
    .replaceAll(rolePattern, "")
    .replaceAll(
      commandPattern,
      generateReplacer(({ name }) => `スラッシュ${name}`, ""),
    )
    .replaceAll(
      customEmojiPattern,
      generateReplacer(({ name }) => name, "", ""),
    )
    .replaceAll(
      timestampPattern,
      generateReplacer((_) => null, "タイムスタンプ"),
    )
    .slice(0, 200);
}

function generateReplacer(
  converter: (groups: { id: string; name: string }) =>
    | string
    | null
    | undefined,
  fallback: string,
  prefix = "@",
) {
  return (...args: unknown[]) => {
    const groups = args.at(-1);

    if (!transmute<{ id: string; name: string }>(groups)) return "";

    return `${prefix}${converter(groups) || fallback}`;
  };
}

interface UriPatternGroup {
  host: string;
  scheme: string;
  ipv6address?: string;
}
