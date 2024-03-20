/*
  Warnings:

  - You are about to drop the `Album` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AlbumToPhoto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Album";

-- DropTable
DROP TABLE "Photo";

-- DropTable
DROP TABLE "_AlbumToPhoto";

-- DropEnum
DROP TYPE "MediaType";

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL DEFAULT prefix_nanoid('ass_'::text),
    "localId" TEXT,
    "uri" TEXT,
    "deviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Asset_userId_creationTime_idx" ON "Asset"("userId", "creationTime");
