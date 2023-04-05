/*
  Warnings:

  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Document";

-- CreateTable
CREATE TABLE "test" (
    "document_id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "author_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,
    "expirate_date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,

    CONSTRAINT "test_pkey" PRIMARY KEY ("document_id")
);
