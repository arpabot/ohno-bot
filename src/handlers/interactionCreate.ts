import {
  GatewayInteractionCreateDispatchData,
  MessageFlags,
  WithIntrinsicProps,
} from "@discordjs/core";
import Help from "../commands/help.js";
import { validate } from "../commands/helper.js";
import { commands } from "../commands/index.js";

export default async ({
  api,
  data,
}: WithIntrinsicProps<GatewayInteractionCreateDispatchData>) => {
  const error = await api.interactions
    .defer(data.id, data.token)
    .catch((x) => x as Error);

  if (error) return console.error(error);
  if (!validate(data)) return false;

  const command = commands.find((x) => x.defition().name === data.data.name);

  if (!command && data.data.name !== "help")
    return await api.interactions.followUp(data.application_id, data.token, {
      content: "古いコマンドを参照しています．世界を削除します．",
      flags: MessageFlags.Ephemeral,
    });

  try {
    await (command ?? new Help()).run(api, data);
  } catch (e) {
    await api.interactions.followUp(data.application_id, data.token, {
      content: `エラーです． \`\`\`${
        e instanceof Error ? e.message : String(e)
      }\`\`\``,
      flags: MessageFlags.Ephemeral,
    });
  }

  return true;
};
