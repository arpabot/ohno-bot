-- CreateTable
CREATE TABLE "Connections" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "voiceChannelId" TEXT NOT NULL,
    "textChannelId" TEXT NOT NULL
);
