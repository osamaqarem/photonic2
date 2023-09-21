-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('photo', 'video');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwsAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bucketName" TEXT NOT NULL,
    "bucketRegion" TEXT NOT NULL,
    "roleArn" TEXT NOT NULL,

    CONSTRAINT "AwsAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("title")
);

-- CreateTable
CREATE TABLE "Photo" (
    "name" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "creationTime" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "_AlbumToPhoto" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AwsAccount_userId_key" ON "AwsAccount"("userId");

-- CreateIndex
CREATE INDEX "Album_userId_idx" ON "Album"("userId");

-- CreateIndex
CREATE INDEX "Photo_userId_idx" ON "Photo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_AlbumToPhoto_AB_unique" ON "_AlbumToPhoto"("A", "B");

-- CreateIndex
CREATE INDEX "_AlbumToPhoto_B_index" ON "_AlbumToPhoto"("B");
