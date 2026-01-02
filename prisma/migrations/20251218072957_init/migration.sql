/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,jobId]` on the table `SavedJobs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SavedJobs_employeeId_jobId_key" ON "SavedJobs"("employeeId", "jobId");
