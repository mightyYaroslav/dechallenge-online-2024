/*
  Warnings:

  - Added the required column `extras` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "extras" JSONB NOT NULL;
