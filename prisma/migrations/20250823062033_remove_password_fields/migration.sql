/*
  Warnings:

  - You are about to drop the column `password` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "password";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ALTER COLUMN "isVerified" SET DEFAULT true;
