-- AlterTable
ALTER TABLE `superadmin` MODIFY `role` ENUM('SUPERADMIN', 'OPERATOR') NOT NULL DEFAULT 'SUPERADMIN';
