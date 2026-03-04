-- CreateTable
CREATE TABLE "Backup" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "size" INTEGER,
    "duration" INTEGER,
    "checksum" TEXT,
    "data" TEXT NOT NULL,
    "triggeredBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupConfig" (
    "id" TEXT NOT NULL,
    "schedule" TEXT NOT NULL DEFAULT 'manual',
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "maxBackups" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "BackupConfig_pkey" PRIMARY KEY ("id")
);
