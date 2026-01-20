import {
  type API,
  type APIApplicationCommandAutocompleteInteraction,
  type APIApplicationCommandInteractionDataBasicOption,
  type APIApplicationCommandInteractionDataSubcommandOption,
  type APIChatInputApplicationCommandInteraction,
  type APIInteractionGuildMember,
  ApplicationCommandOptionType,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import type { NonNullableByKey } from "../commons/types.js";

export type GuildInteraction = NonNullableByKey<
  NonNullableByKey<
    APIChatInputApplicationCommandInteraction,
    "guild_id",
    string
  >,
  "member",
  APIInteractionGuildMember
>;

export interface CommandContext {
  api: API;
  interaction: GuildInteraction;
}

export interface SubcommandContext extends CommandContext {
  options: APIApplicationCommandInteractionDataBasicOption[];
}

export interface ICommand {
  definition(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(ctx: CommandContext): Promise<unknown>;
  autoComplete?(
    api: API,
    interaction: APIApplicationCommandAutocompleteInteraction,
  ): Promise<unknown>;
}

export interface ISubcommandHandler {
  run(ctx: SubcommandContext): Promise<unknown>;
  autoComplete?(
    api: API,
    interaction: APIApplicationCommandAutocompleteInteraction,
    options: APIApplicationCommandInteractionDataBasicOption[],
  ): Promise<unknown>;
}

export function getOption<T extends string | number | boolean>(
  options: APIApplicationCommandInteractionDataBasicOption[],
  name: string,
): T | undefined {
  const opt = options.find((o) => o.name === name);

  if (!opt || !("value" in opt)) return undefined;

  return opt.value as T;
}

export function getRequiredOption<T extends string | number | boolean>(
  options: APIApplicationCommandInteractionDataBasicOption[],
  name: string,
): T {
  const value = getOption<T>(options, name);

  if (value === undefined) {
    console.error(`Required option '${name}' is missing`);
    throw new Error(`必須オプション '${name}' が見つかりません`);
  }

  return value;
}

export function getFocusedOption(
  options: APIApplicationCommandInteractionDataBasicOption[],
): { name: string; value: string } | undefined {
  const opt = options.find(
    (o) =>
      o.type === ApplicationCommandOptionType.String &&
      "focused" in o &&
      o.focused,
  );

  if (!opt || !("value" in opt)) return undefined;

  return { name: opt.name, value: String(opt.value) };
}

export abstract class SubcommandGroup implements ICommand {
  protected abstract handlers: Record<string, ISubcommandHandler>;

  abstract definition(): RESTPostAPIChatInputApplicationCommandsJSONBody;

  async run(ctx: CommandContext): Promise<unknown> {
    const subcommand = ctx.interaction.data.options?.[0] as
      | APIApplicationCommandInteractionDataSubcommandOption
      | undefined;

    if (!subcommand) {
      throw new Error("No subcommand provided");
    }

    const handler = this.handlers[subcommand.name];

    if (!handler) {
      throw new Error(`Unknown subcommand: ${subcommand.name}`);
    }

    return handler.run({
      ...ctx,
      options: subcommand.options ?? [],
    });
  }

  async autoComplete(
    api: API,
    interaction: APIApplicationCommandAutocompleteInteraction,
  ): Promise<unknown> {
    const subcommand = interaction.data.options?.[0] as
      | APIApplicationCommandInteractionDataSubcommandOption
      | undefined;

    if (!subcommand) return;

    const handler = this.handlers[subcommand.name];

    if (!handler?.autoComplete) return;

    return handler.autoComplete(api, interaction, subcommand.options ?? []);
  }
}

export function replySuccess(
  ctx: CommandContext,
  title: string,
  description: string,
): Promise<unknown> {
  return ctx.api.interactions.editReply(
    ctx.interaction.application_id,
    ctx.interaction.token,
    {
      embeds: [{ title, description, color: 0x00ff00 }],
    },
  );
}

export function replyError(
  ctx: CommandContext,
  description: string,
): Promise<unknown> {
  return ctx.api.interactions.editReply(
    ctx.interaction.application_id,
    ctx.interaction.token,
    {
      embeds: [{ title: "エラー", description, color: 0xff0000 }],
    },
  );
}
