/*
  Warnings:

  - You are about to drop the `ch_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ch_users" DROP CONSTRAINT "ch_users_chName_fkey";

-- DropForeignKey
ALTER TABLE "history" DROP CONSTRAINT "history_name_fkey";

-- DropTable
DROP TABLE "ch_users";

-- DropTable
DROP TABLE "channel";

-- DropTable
DROP TABLE "history";

-- DropTable
DROP TABLE "member";

-- CreateTable
CREATE TABLE "Member" (
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
    "twoFactor" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" VARCHAR(512) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "player" TEXT,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "option" INTEGER,
    "result" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "name" TEXT NOT NULL,
    "passwd" TEXT,
    "property" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ChUsers" (
    "id" SERIAL NOT NULL,
    "userName" VARCHAR(20) NOT NULL,
    "userFd" INTEGER NOT NULL,
    "property" INTEGER NOT NULL DEFAULT 0,
    "mute" TIMESTAMP(3),
    "chName" TEXT NOT NULL,

    CONSTRAINT "ChUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_friend" (
    "A" VARCHAR(20) NOT NULL,
    "B" VARCHAR(20) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChUsers_userName_key" ON "ChUsers"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "ChUsers_userFd_key" ON "ChUsers"("userFd");

-- CreateIndex
CREATE UNIQUE INDEX "_friend_AB_unique" ON "_friend"("A", "B");

-- CreateIndex
CREATE INDEX "_friend_B_index" ON "_friend"("B");

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_name_fkey" FOREIGN KEY ("name") REFERENCES "Member"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChUsers" ADD CONSTRAINT "ChUsers_chName_fkey" FOREIGN KEY ("chName") REFERENCES "Channel"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend" ADD CONSTRAINT "_friend_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend" ADD CONSTRAINT "_friend_B_fkey" FOREIGN KEY ("B") REFERENCES "Member"("name") ON DELETE CASCADE ON UPDATE CASCADE;
