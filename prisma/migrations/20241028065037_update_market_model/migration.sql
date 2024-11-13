/*
  Warnings:

  - You are about to drop the column `pair` on the `Market` table. All the data in the column will be lost.
  - Added the required column `pairSale` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purChase` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Market_pair_key";

-- AlterTable
ALTER TABLE "Market" DROP COLUMN "pair",
ADD COLUMN     "pairSale" TEXT NOT NULL,
ADD COLUMN     "purChase" TEXT NOT NULL;
