-- CreateTable
CREATE TABLE "EventTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "orderId" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" REAL NOT NULL,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventTicket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
