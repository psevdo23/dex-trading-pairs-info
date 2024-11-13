/*
  Warnings:

  - A unique constraint covering the columns `[pool_addr]` on the table `DedustInf` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pool_addr` to the `DedustInf` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DedustInf" ADD COLUMN     "pool_addr" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DedustInf_pool_addr_key" ON "DedustInf"("pool_addr");
