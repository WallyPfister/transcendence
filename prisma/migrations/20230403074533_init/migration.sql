/*
  Warnings:

  - The primary key for the `friend` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `friend` table. All the data in the column will be lost.
  - Made the column `friend` on table `friend` required. This step will fail if there are existing NULL values in that column.
  - Made the column `memberId` on table `friend` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_memberId_fkey";

-- AlterTable
ALTER TABLE "friend" DROP CONSTRAINT "friend_pkey",
DROP COLUMN "id",
ALTER COLUMN "friend" SET NOT NULL,
ALTER COLUMN "memberId" SET NOT NULL,
ADD CONSTRAINT "friend_pkey" PRIMARY KEY ("friend", "memberId");

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
