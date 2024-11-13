/*
  Warnings:

  - You are about to drop the `SwapSimulation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SwapSimulation";

-- CreateTable
CREATE TABLE "StonfiInfo" (
    "id" SERIAL NOT NULL,
    "token_0_address" TEXT NOT NULL,
    "token_1_address" TEXT NOT NULL,
    "token_0_reserve" TEXT NOT NULL,
    "token_1_reserve" TEXT NOT NULL,
    "lpFee" TEXT NOT NULL,
    "protocolFee" TEXT NOT NULL,
    "refFee" TEXT NOT NULL,

    CONSTRAINT "StonfiInfo_pkey" PRIMARY KEY ("id")
);
