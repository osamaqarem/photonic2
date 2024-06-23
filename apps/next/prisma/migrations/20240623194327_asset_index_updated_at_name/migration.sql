-- DropIndex
DROP INDEX "Asset_userId_creationTime_idx";

-- CreateIndex
CREATE INDEX "Asset_userId_updatedAt_name_idx" ON "Asset"("userId", "updatedAt", "name");
