import {
  type GatewayInteractionCreateDispatchData,
  InteractionType,
  MessageFlags,
  type ToEventProps,
} from "@discordjs/core";
import Help from "../commands/help.js";
import { validate } from "../commands/helper.js";
import { commands } from "../commands/index.js";

export default async ({
  api,
  data,
}: ToEventProps<GatewayInteractionCreateDispatchData>): Promise<boolean> => {
  if (data.type === InteractionType.ApplicationCommandAutocomplete) {
    const command = commands.find(
      (x) => x.definition().name === data.data.name,
    );

    command?.autoComplete?.(api, data).catch(console.error);

    return true;
  }

  if (data.type === InteractionType.ApplicationCommand) {
    const error = await api.interactions
      .defer(data.id, data.token)
      .catch((x) => x as Error);

    if (error) {
      console.error(error);

      return false;
    }

    if (!validate(data)) {
      return false;
    }

    const command = commands.find(
      (x) => x.definition().name === data.data.name,
    );

    if (!command && data.data.name !== "help") {
      await api.interactions.followUp(data.application_id, data.token, {
        content: "古いコマンドを参照しています．世界を削除します．",
        flags: MessageFlags.Ephemeral,
      });

      return true;
    }

    try {
      const handler = command ?? new Help();

      await handler.run({ api, interaction: data });
    } catch (e) {
      await api.interactions.followUp(data.application_id, data.token, {
        content: `エラーです． \`\`\`${
          e instanceof Error ? e.message : String(e)
        }\`\`\``,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  return true;
};
