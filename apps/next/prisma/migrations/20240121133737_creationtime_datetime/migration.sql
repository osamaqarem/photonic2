/*
  Warnings:

  - Changed the type of `creationTime` on the `Photo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "creationTime",
ADD COLUMN     "creationTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Photo_userId_creationTime_idx" ON "Photo"("userId", "creationTime");
