/*
  Warnings:

  - Added the required column `token_0_name` to the `StonfiInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_1_name` to the `StonfiInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StonfiInfo" ADD COLUMN     "token_0_name" TEXT NOT NULL,
ADD COLUMN     "token_1_name" TEXT NOT NULL;
