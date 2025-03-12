// src/student/student.module.ts
import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';

@Module({
  providers: [StudentService],
  controllers: [StudentController],
  exports: [],
  imports: [],
})
export class StudentModule {}
