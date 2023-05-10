-- CreateTable
CREATE TABLE "Document" (
    "document_id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "author_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,
    "expirate_date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("document_id")
);
