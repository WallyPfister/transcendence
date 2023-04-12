-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_memberId_fkey";

-- AlterTable
ALTER TABLE "friend" ALTER COLUMN "memberId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
