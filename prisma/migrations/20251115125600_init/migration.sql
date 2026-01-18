-- CreateTable
CREATE TABLE "Projects" (
    "id" SERIAL NOT NULL,
    "userKeyId" INTEGER NOT NULL,
    "projectTitle" TEXT,
    "client" TEXT,
    "skillsUsed" TEXT[],
    "status" TEXT,
    "startYear" TEXT,
    "startMonth" TEXT,
    "description" TEXT,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
