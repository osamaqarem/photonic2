-- https://github.com/Jakeii/nanoid-postgres/blob/main/nanoid.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION prefix_nanoid(prefix text, size int DEFAULT 12)
RETURNS text AS $$
DECLARE
  id text := '';
  i int := 0;
  urlAlphabet char(36) := '0123456789abcdefghijklmnopqrstuvwxyz';
  bytes bytea := gen_random_bytes(size);
  byte int;
  pos int;
BEGIN
  WHILE i < size LOOP
    byte := get_byte(bytes, i);
    pos := (byte & 35) + 1; -- + 1 because substr starts at 1 for some reason
    id := id || substr(urlAlphabet, pos, 1);
    i = i + 1;
  END LOOP;
  RETURN concat(prefix, id);
END
$$ LANGUAGE PLPGSQL VOLATILE;

-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "id" SET DEFAULT prefix_nanoid('ass_'::text);

-- AlterTable
ALTER TABLE "AwsAccount" ALTER COLUMN "id" SET DEFAULT prefix_nanoid('aws_'::text);

-- AlterTable
ALTER TABLE "AwsBucket" ALTER COLUMN "id" SET DEFAULT prefix_nanoid('buk_'::text);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT prefix_nanoid('usr_'::text);
