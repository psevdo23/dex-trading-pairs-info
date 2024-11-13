-- CreateTable
CREATE TABLE "Market" (
    "id" SERIAL NOT NULL,
    "pair" TEXT NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Market_pair_key" ON "Market"("pair");
