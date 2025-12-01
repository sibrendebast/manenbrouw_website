-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "ticketPrice" REAL,
    "capacity" INTEGER,
    "ticketsSold" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
