export const env = {
  token: getRequiredEnv("token"),
  azureKey: getRequiredEnv("key"),
  azureEndpoint: getRequiredEnv("endpoint"),
  etcdHosts: process.env["ETCD_HOSTS"]?.split(",") ?? ["localhost:2379"],
} as const;

export const BOT_USER_ID = (() => {
  try {
    const base64Id = env.token.split(".")[0];

    if (!base64Id) {
      throw new Error("Missing token part");
    }

    return atob(base64Id);
  } catch (error) {
    console.error("Invalid token format:", error);
    process.exit(1);
  }
})();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }

  return value;
}
