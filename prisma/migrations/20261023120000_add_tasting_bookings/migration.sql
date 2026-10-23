-- CreateEnum
CREATE TYPE "TastingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TastingPaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "TastingBooking" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "scheduledTime" TEXT,
    "peopleCount" INTEGER NOT NULL,
    "formula" TEXT NOT NULL,
    "keepGlass" BOOLEAN NOT NULL DEFAULT false,
    "locationType" TEXT NOT NULL DEFAULT 'Brouwerij',
    "address" TEXT,
    "totalPrice" DOUBLE PRECISION,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "paymentStatus" "TastingPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentMethod" TEXT,
    "invoiceUrl" TEXT,
    "customerMessage" TEXT,
    "adminNotes" TEXT,
    "status" "TastingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TastingBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TastingBooking_bookingNumber_key" ON "TastingBooking"("bookingNumber");
