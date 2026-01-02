-- DropForeignKey
ALTER TABLE "Applicant" DROP CONSTRAINT "Applicant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Education" DROP CONSTRAINT "Education_userKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Employment" DROP CONSTRAINT "Employment_userKeyId_fkey";

-- DropForeignKey
ALTER TABLE "ITSkills" DROP CONSTRAINT "ITSkills_userKeyId_fkey";

-- DropForeignKey
ALTER TABLE "KeySkills" DROP CONSTRAINT "KeySkills_userKeyId_fkey";

-- DropForeignKey
ALTER TABLE "LanguageProficiency" DROP CONSTRAINT "LanguageProficiency_userDetailId_fkey";

-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_userKeyId_fkey";

-- DropForeignKey
ALTER TABLE "UserPersonalDetails" DROP CONSTRAINT "UserPersonalDetails_userId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "experience" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "UserPersonalDetails" ADD CONSTRAINT "UserPersonalDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageProficiency" ADD CONSTRAINT "LanguageProficiency_userDetailId_fkey" FOREIGN KEY ("userDetailId") REFERENCES "UserPersonalDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeySkills" ADD CONSTRAINT "KeySkills_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ITSkills" ADD CONSTRAINT "ITSkills_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_userKeyId_fkey" FOREIGN KEY ("userKeyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
