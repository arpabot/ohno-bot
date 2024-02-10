/*
  Warnings:

  - A unique constraint covering the columns `[guildId,word]` on the table `Dictionary` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Dictionary_word_key";

-- CreateIndex
CREATE UNIQUE INDEX "Dictionary_guildId_word_key" ON "Dictionary"("guildId", "word");
