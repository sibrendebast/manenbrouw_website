-- AlterTable
ALTER TABLE "Newsletter" ADD COLUMN     "targetAudience" TEXT NOT NULL DEFAULT 'ALL';

-- AlterTable
ALTER TABLE "NewsletterSubscriber" ADD COLUMN     "isCommercial" BOOLEAN NOT NULL DEFAULT false;
