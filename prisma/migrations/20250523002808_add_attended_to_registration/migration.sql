-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "attended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attended_at" TIMESTAMP(3);
