-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "id" SET DEFAULT prefix_nanoid('ast_'::text);
