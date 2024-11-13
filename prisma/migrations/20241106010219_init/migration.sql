-- CreateTable
CREATE TABLE "DedustInf" (
    "id" SERIAL NOT NULL,
    "token_0_address" TEXT NOT NULL,
    "token_1_address" TEXT NOT NULL,
    "token_0_name" TEXT NOT NULL,
    "token_1_name" TEXT NOT NULL,
    "token_0_reserve" TEXT NOT NULL,
    "token_1_reserve" TEXT NOT NULL,
    "fee" TEXT NOT NULL,

    CONSTRAINT "DedustInf_pkey" PRIMARY KEY ("id")
);
