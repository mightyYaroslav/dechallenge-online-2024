/*
  Warnings:

  - You are about to drop the column `extras` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "extras",
ADD COLUMN     "points" TEXT[];
