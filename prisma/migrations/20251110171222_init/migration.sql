-- CreateTable
CREATE TABLE "Employment" (
    "id" SERIAL NOT NULL,
    "userKeyId" INTEGER NOT NULL,
    "department" TEXT,
    "totalExpYear" TEXT,
    "totalExpMonth" TEXT,
    "tillYear" TEXT,
    "tillMonth" TEXT,
    "joinYear" TEXT,
    "joinMonth" TEXT,
    "salary" TEXT,
    "jobProfile" TEXT,
    "noticePeriod" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,

    CONSTRAINT "Employment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
