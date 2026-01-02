/*
  Warnings:

  - Added the required column `actor` to the `ApplicationTimeline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicationTimeline" ADD COLUMN     "actor" TEXT NOT NULL,
ADD COLUMN     "actorId" INTEGER;
