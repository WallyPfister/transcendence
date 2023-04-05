/*
  Warnings:

  - You are about to drop the `test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "test";

-- CreateTable
CREATE TABLE "member" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "intraId" VARCHAR(20) NOT NULL,
    "avartar" VARCHAR(100) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "win" INTEGER NOT NULL DEFAULT 0,
    "lose" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 1000,
    "achieve" INTEGER NOT NULL DEFAULT 0,
    "socket" INTEGER NOT NULL DEFAULT -1,
    "twoFactor" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend" (
    "id" SERIAL NOT NULL,
    "friend" TEXT,
    "memberId" INTEGER NOT NULL,

    CONSTRAINT "friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" SERIAL NOT NULL,
    "userA" TEXT,
    "userB" TEXT,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "winner" INTEGER,
    "isLadder" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "name" TEXT NOT NULL DEFAULT '1234',
    "passwd" TEXT,
    "property" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "channel_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "channel_list" (
    "id" SERIAL NOT NULL,
    "channelName" TEXT NOT NULL,

    CONSTRAINT "channel_list_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_list" ADD CONSTRAINT "channel_list_channelName_fkey" FOREIGN KEY ("channelName") REFERENCES "channel"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
