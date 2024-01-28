-- CreateTable
CREATE TABLE "Synthesizer" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "speed" REAL NOT NULL,
    "pitch" REAL NOT NULL,
    "voice" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Dictionary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "read" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Dictionary_word_key" ON "Dictionary"("word");
