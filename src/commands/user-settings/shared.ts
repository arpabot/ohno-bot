import { db, type Synthesizer } from "../../db/index.js";

export async function getDefaultSynthesizer(
  userId: string,
): Promise<Synthesizer> {
  const existing = await db.synthesizer.findByUserId(userId);

  return (
    existing ?? {
      pitch: 1.0,
      speed: 1.0,
      userId,
      voice: "ja-JP-NanamiNeural",
    }
  );
}
