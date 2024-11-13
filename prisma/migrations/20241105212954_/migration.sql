/*
  Warnings:

  - A unique constraint covering the columns `[pool_addr]` on the table `StonfiInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pool_addr` to the `StonfiInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StonfiInfo" ADD COLUMN     "pool_addr" TEXT NOT NULL,
ALTER COLUMN "token_0_name" DROP NOT NULL,
ALTER COLUMN "token_1_name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StonfiInfo_pool_addr_key" ON "StonfiInfo"("pool_addr");
