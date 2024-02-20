import manifest from "../../.github/release-please/.release-please-manifest.json" assert {
  type: "json",
};

const escapeMap: Record<string, string | undefined> = {
  "<": "&lt;",
  ">": "&gt;",
  // biome-ignore format: single quot is sucks
  "\"": "&quot;",
  "'": "&apos;",
  "&": "&amp;",
};

export const voices = Object.fromEntries(
  ["Nanami", "Keita", "Aoi", "Daichi", "Mayu", "Naoki", "Shiori"].map((x) => [
    x,
    `ja-JP-${x}Neural`,
  ]),
);

export default class Synthesizer {
  constructor(
    private key: string,
    private region: string,
    public voice: string,
    public userId: string,
    public pitch: number,
    public speed: number,
  ) {}

  async synthesis(text: string) {
    const res = await fetch(this.baseURL("v1"), {
      method: "POST",
      body: `
<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"ja-JP\">\
<voice name=\"${this.voice}\">\
  <prosody rate=\"${this.speed}\" volume=\"75\">\
    ${text.replaceAll(/["&'<>"]/g, (match: string) => {
      return escapeMap[match] ?? "";
    })}\
  </prosody>\
</voice>\
</speak>`,
      headers: {
        "User-Agent": `OHNO/${manifest["."]}`,
        "Content-Type": "application/ssml+xml",
        "Ocp-Apim-Subscription-Key": this.key,
        "X-Microsoft-OutputFormat": "ogg-48khz-16bit-mono-opus",
      },
    });

    if (!res.ok) throw new Error("読み上げに失敗しました");

    return res.body;
  }

  baseURL(route: string) {
    return `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/${route}`;
  }
}
