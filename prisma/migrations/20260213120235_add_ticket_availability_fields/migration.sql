-- AlterTable
ALTER TABLE "Event" ADD COLUMN "ticketSalesStartDate" TIMESTAMP(3),
ADD COLUMN "earlyBirdPrice" DOUBLE PRECISION,
ADD COLUMN "earlyBirdEndDate" TIMESTAMP(3);
