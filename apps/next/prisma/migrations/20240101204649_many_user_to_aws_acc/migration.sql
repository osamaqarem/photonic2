/*
  Warnings:

  - You are about to drop the column `bucketName` on the `AwsAccount` table. All the data in the column will be lost.
  - You are about to drop the column `bucketRegion` on the `AwsAccount` table. All the data in the column will be lost.
  - You are about to drop the column `roleArn` on the `AwsAccount` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AwsAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `AwsAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `AwsAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AwsAccount_userId_key";

-- DropIndex
DROP INDEX "Photo_userId_idx";

-- AlterTable
ALTER TABLE "AwsAccount" DROP COLUMN "bucketName",
DROP COLUMN "bucketRegion",
DROP COLUMN "roleArn",
DROP COLUMN "userId",
ADD COLUMN     "externalId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Photo" ALTER COLUMN "creationTime" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "awsAccountId" TEXT;

-- CreateTable
CREATE TABLE "AwsBucket" (
    "id" TEXT NOT NULL DEFAULT prefix_nanoid('buk_'::text),
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "roleArn" TEXT NOT NULL,
    "awsAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AwsBucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AwsBucket_name_key" ON "AwsBucket"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AwsBucket_userId_key" ON "AwsBucket"("userId");

-- CreateIndex
CREATE INDEX "AwsBucket_awsAccountId_userId_idx" ON "AwsBucket"("awsAccountId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AwsAccount_externalId_key" ON "AwsAccount"("externalId");

-- CreateIndex
CREATE INDEX "Photo_userId_creationTime_idx" ON "Photo"("userId", "creationTime");

-- CreateIndex
CREATE INDEX "User_awsAccountId_idx" ON "User"("awsAccountId");
