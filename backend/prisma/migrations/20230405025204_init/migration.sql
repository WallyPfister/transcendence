/*
  Warnings:

  - You are about to drop the column `isLadder` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `userA` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `userB` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `winner` on the `history` table. All the data in the column will be lost.
  - The primary key for the `member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `member` table. All the data in the column will be lost.
  - You are about to drop the `friend` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_name]` on the table `ch_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_fd]` on the table `ch_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_fd` to the `ch_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_name` to the `ch_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_memberId_fkey";

-- AlterTable
ALTER TABLE "ch_users" ADD COLUMN     "mute" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "property" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_fd" INTEGER NOT NULL,
ADD COLUMN     "user_name" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "channel" ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "history" DROP COLUMN "isLadder",
DROP COLUMN "userA",
DROP COLUMN "userB",
DROP COLUMN "winner",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "option" INTEGER,
ADD COLUMN     "player" TEXT,
ADD COLUMN     "result" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "member" DROP CONSTRAINT "member_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "member_pkey" PRIMARY KEY ("name");

-- DropTable
DROP TABLE "friend";

-- CreateIndex
CREATE UNIQUE INDEX "ch_users_user_name_key" ON "ch_users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "ch_users_user_fd_key" ON "ch_users"("user_fd");

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_name_fkey" FOREIGN KEY ("name") REFERENCES "member"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
