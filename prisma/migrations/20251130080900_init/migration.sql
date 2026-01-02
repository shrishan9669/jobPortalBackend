-- CreateTable
CREATE TABLE "Employer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerify" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "hiringfor" TEXT,
    "company" TEXT,
    "industry" TEXT,
    "noOfEmployees" INTEGER,
    "designation" TEXT,
    "pincode" TEXT,
    "companyAddress" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employer_email_key" ON "Employer"("email");
