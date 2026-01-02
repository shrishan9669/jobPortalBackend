-- CreateTable
CREATE TABLE "ApplicationTimeline" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationTimeline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApplicationTimeline" ADD CONSTRAINT "ApplicationTimeline_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
