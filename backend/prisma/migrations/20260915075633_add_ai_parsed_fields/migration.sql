-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "parseStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "remotePolicy" TEXT,
ADD COLUMN     "salaryRange" TEXT,
ADD COLUMN     "seniority" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
