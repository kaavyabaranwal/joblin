CREATE EXTENSION IF NOT EXISTS vector;
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "embedding" vector(1024);
