/*
  Warnings:

  - You are about to drop the column `experience` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Applicant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobId,userId]` on the table `Applicant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "experience",
DROP COLUMN "skills",
ADD COLUMN     "experienceSnapshot" TEXT,
ADD COLUMN     "skillsSnapshot" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_jobId_userId_key" ON "Applicant"("jobId", "userId");
