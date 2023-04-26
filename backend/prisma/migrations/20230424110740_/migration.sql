/*
  Warnings:

  - You are about to drop the `ChUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `History` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChUsers" DROP CONSTRAINT "ChUsers_chName_fkey";

-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_name_fkey";

-- DropForeignKey
ALTER TABLE "_friend" DROP CONSTRAINT "_friend_A_fkey";

-- DropForeignKey
ALTER TABLE "_friend" DROP CONSTRAINT "_friend_B_fkey";

-- DropTable
DROP TABLE "ChUsers";

-- DropTable
DROP TABLE "Channel";

-- DropTable
DROP TABLE "History";

-- DropTable
DROP TABLE "Member";

-- CreateTable
CREATE TABLE "member" (
    "name" VARCHAR(20) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "intraId" VARCHAR(20) NOT NULL,
    "avatar" VARCHAR(100) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "win" INTEGER NOT NULL DEFAULT 0,
    "lose" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 1000,
    "achieve" INTEGER NOT NULL DEFAULT 0,
    "socket" INTEGER NOT NULL DEFAULT -1,
    "refreshToken" VARCHAR(512) NOT NULL,
    "twoFactor" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "member_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "history" (
    "id" SERIAL NOT NULL,
    "player" TEXT,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "option" INTEGER,
    "result" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "name" TEXT NOT NULL,
    "passwd" TEXT,
    "property" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "channel_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "chusers" (
    "id" SERIAL NOT NULL,
    "userName" VARCHAR(20) NOT NULL,
    "userFd" INTEGER NOT NULL,
    "property" INTEGER NOT NULL DEFAULT 0,
    "mute" TIMESTAMP(3),
    "chName" TEXT NOT NULL,

    CONSTRAINT "chusers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_name_key" ON "member"("name");

-- CreateIndex
CREATE UNIQUE INDEX "member_intraId_key" ON "member"("intraId");

-- CreateIndex
CREATE UNIQUE INDEX "channel_name_key" ON "channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "chusers_userName_key" ON "chusers"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "chusers_userFd_key" ON "chusers"("userFd");

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_name_fkey" FOREIGN KEY ("name") REFERENCES "member"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chusers" ADD CONSTRAINT "chusers_chName_fkey" FOREIGN KEY ("chName") REFERENCES "channel"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend" ADD CONSTRAINT "_friend_A_fkey" FOREIGN KEY ("A") REFERENCES "member"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend" ADD CONSTRAINT "_friend_B_fkey" FOREIGN KEY ("B") REFERENCES "member"("name") ON DELETE CASCADE ON UPDATE CASCADE;
