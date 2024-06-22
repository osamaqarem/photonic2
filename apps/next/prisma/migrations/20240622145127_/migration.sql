/*
  Warnings:

  - You are about to drop the column `localId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `Asset` table. All the data in the column will be lost.
  - Added the required column `modificationTime` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Made the column `deviceId` on table `Asset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "localId",
DROP COLUMN "type",
DROP COLUMN "uri",
ADD COLUMN     "modificationTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "deviceId" SET NOT NULL;
