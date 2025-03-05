-- CreateIndex
CREATE INDEX `loans_status_idx` ON `loans`(`status`);

-- CreateIndex
CREATE INDEX `students_full_name_idx` ON `students`(`full_name`);

-- RenameIndex
ALTER TABLE `loans` RENAME INDEX `loans_bookId_fkey` TO `loans_bookId_idx`;

-- RenameIndex
ALTER TABLE `loans` RENAME INDEX `loans_studentId_fkey` TO `loans_studentId_idx`;
