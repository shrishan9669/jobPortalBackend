-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'jobseeker',
    "phone" TEXT,
    "location" TEXT,
    "profilePic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "experience" TEXT DEFAULT 'fresher',
    "careerBreak" TEXT,
    "disability" TEXT,
    "militaryExp" TEXT,
    "profileSummary" TEXT,
    "resumeHeadline" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPersonalDetails" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gender" TEXT,
    "moreInfo" TEXT[],
    "maritalStatus" TEXT,
    "dateofBirth" TIMESTAMP(3),
    "category" TEXT,
    "permanentAddress" TEXT,
    "hometown" TEXT,
    "pincode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPersonalDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageProficiency" (
    "id" SERIAL NOT NULL,
    "userDetailId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canWrite" BOOLEAN NOT NULL DEFAULT false,
    "canSpeak" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LanguageProficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeySkills" (
    "id" SERIAL NOT NULL,
    "userKeyId" INTEGER NOT NULL,
    "skillSet" TEXT[],

    CONSTRAINT "KeySkills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ITSkills" (
    "id" SERIAL NOT NULL,
    "userKeyId" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "lastused" TEXT NOT NULL,
    "expYears" TEXT NOT NULL,
    "expMonths" TEXT NOT NULL,

    CONSTRAINT "ITSkills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalDetails_userId_key" ON "UserPersonalDetails"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KeySkills_userKeyId_key" ON "KeySkills"("userKeyId");

-- AddForeignKey
ALTER TABLE "UserPersonalDetails" ADD CONSTRAINT "UserPersonalDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageProficiency" ADD CONSTRAINT "LanguageProficiency_userDetailId_fkey" FOREIGN KEY ("userDetailId") REFERENCES "UserPersonalDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeySkills" ADD CONSTRAINT "KeySkills_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ITSkills" ADD CONSTRAINT "ITSkills_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
