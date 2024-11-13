/*
  Warnings:

  - Added the required column `token_0_type` to the `DedustInf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_1_type` to the `DedustInf` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DedustInf" ADD COLUMN     "token_0_type" TEXT NOT NULL,
ADD COLUMN     "token_1_type" TEXT NOT NULL,
ALTER COLUMN "token_0_name" DROP NOT NULL,
ALTER COLUMN "token_1_name" DROP NOT NULL;
