-- https://github.com/prisma/prisma/issues/6719#issuecomment-1286354808
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION prefix_uuid(prefix text) RETURNS text AS $$
BEGIN
    RETURN concat(prefix, gen_random_uuid());
END;
$$ LANGUAGE PLPGSQL VOLATILE;

-- AlterTable
ALTER TABLE "Album" ALTER COLUMN "id" SET DEFAULT prefix_uuid('alb_'::text);

-- AlterTable
ALTER TABLE "AwsAccount" ALTER COLUMN "id" SET DEFAULT prefix_uuid('aws_'::text);

-- AlterTable
ALTER TABLE "Photo" ALTER COLUMN "id" SET DEFAULT prefix_uuid('pho_'::text);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT prefix_uuid('usr_'::text);
