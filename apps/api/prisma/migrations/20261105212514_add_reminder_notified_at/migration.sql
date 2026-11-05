-- DropIndex
DROP INDEX "Reminder_dueAt_done_idx";

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "notifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Reminder_done_notifiedAt_dueAt_idx" ON "Reminder"("done", "notifiedAt", "dueAt");
