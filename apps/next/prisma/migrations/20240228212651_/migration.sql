-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "awsAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwsAccount" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,

    CONSTRAINT "AwsAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwsBucket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "roleArn" TEXT NOT NULL,
    "awsAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AwsBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_awsAccountId_idx" ON "User"("awsAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "AwsAccount_externalId_key" ON "AwsAccount"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "AwsBucket_name_key" ON "AwsBucket"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AwsBucket_userId_key" ON "AwsBucket"("userId");

-- CreateIndex
CREATE INDEX "AwsBucket_awsAccountId_userId_idx" ON "AwsBucket"("awsAccountId", "userId");

-- CreateIndex
CREATE INDEX "Asset_userId_creationTime_idx" ON "Asset"("userId", "creationTime");
