-- CreateTable
CREATE TABLE "SwapSimulation" (
    "id" SERIAL NOT NULL,
    "offerAddress" TEXT NOT NULL,
    "askAddress" TEXT NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "slippageTolerance" DOUBLE PRECISION NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwapSimulation_pkey" PRIMARY KEY ("id")
);
