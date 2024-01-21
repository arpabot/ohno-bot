import { version } from "../../package.json";

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
    return (
      await fetch(this.baseURL("v1"), {
        method: "POST",
        body: `<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"ja-JP\">\
      <voice name=\"${this.voice}\">\
          <prosody rate=\"${this.speed + 0.2}\">\
            ${text}\
          </prosody>\
        </voice>\
      </speak>`,
        headers: {
          "User-Agent": `OHNO/${version}`,
          "Content-Type": "application/ssml+xml",
          "Ocp-Apim-Subscription-Key": this.key,
          "X-Microsoft-OutputFormat": "raw-48khz-16bit-mono-pcm",
        },
      })
    ).body;
  }

  baseURL(route: string) {
    return `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/${route}`;
  }

  toJSON() {
    return JSON.stringify({
      voice: this.voice,
      spped: this.speed,
      userId: this.userId,
      pitch: this.pitch,
    });
  }
}
