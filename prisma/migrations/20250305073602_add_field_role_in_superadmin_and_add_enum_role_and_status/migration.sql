/*
  Warnings:

  - You are about to alter the column `status` on the `loans` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `loans` MODIFY `status` ENUM('APPROVED', 'RETURNED') NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE `superadmin` ADD COLUMN `role` ENUM('SUPERADMIN') NOT NULL DEFAULT 'SUPERADMIN';
