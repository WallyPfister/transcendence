/*
  Warnings:

  - You are about to drop the `channel_list` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `channel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "channel_list" DROP CONSTRAINT "channel_list_channelName_fkey";

-- DropTable
DROP TABLE "channel_list";

-- CreateTable
CREATE TABLE "ch_users" (
    "id" SERIAL NOT NULL,
    "chName" TEXT NOT NULL,

    CONSTRAINT "ch_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "channel_name_key" ON "channel"("name");

-- AddForeignKey
ALTER TABLE "ch_users" ADD CONSTRAINT "ch_users_chName_fkey" FOREIGN KEY ("chName") REFERENCES "channel"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
