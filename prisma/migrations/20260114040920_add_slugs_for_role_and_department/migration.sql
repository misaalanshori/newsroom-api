/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `department` ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `role` ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Department_slug_key` ON `Department`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Role_slug_key` ON `Role`(`slug`);
