-- CreateTable
CREATE TABLE "Education" (
    "id" SERIAL NOT NULL,
    "userKeyId" INTEGER NOT NULL,
    "education" TEXT NOT NULL,
    "course" TEXT,
    "startingCourse" TEXT,
    "endingCourse" TEXT,
    "marks" TEXT,
    "courseType" TEXT,
    "gradingSystem" TEXT,
    "medium" TEXT,
    "passout" TEXT,
    "board" TEXT,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Education_userKeyId_education_key" ON "Education"("userKeyId", "education");

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
