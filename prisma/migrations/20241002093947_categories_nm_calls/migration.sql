-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_callId_fkey";

-- AlterTable
ALTER TABLE "Call" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "emotionalTone" DROP NOT NULL,
ALTER COLUMN "text" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CategoryOnCalls" (
    "categoryId" INTEGER NOT NULL,
    "callId" INTEGER NOT NULL,

    CONSTRAINT "CategoryOnCalls_pkey" PRIMARY KEY ("categoryId","callId")
);

-- AddForeignKey
ALTER TABLE "CategoryOnCalls" ADD CONSTRAINT "CategoryOnCalls_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryOnCalls" ADD CONSTRAINT "CategoryOnCalls_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
