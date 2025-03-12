// prisma/student.ts
import { PrismaClient } from '@prisma/client';
import { StudentValidation } from '../src/student/student.validation';
import { CreateStudentRequest } from '../src/model/student.model';

const prisma = new PrismaClient();

async function main() {
  // Sample Indonesian names
  const indonesianNames = [
    'Ahmad Rifai',
    'Dewi Lestari',
    'Budi Santoso',
    'Siti Nurhaliza',
    'Hendra Wijaya',
    'Rina Kartika',
    'Bambang Sutrisno',
    'Nurul Hidayah',
    'Joko Widodo',
    'Maya Anggraini',
    'Agus Setiawan',
    'Putri Rahayu',
    'Dian Sastrowardoyo',
    'Rudi Hartono',
    'Lina Wulandari',
  ];

  // Generate student data with sequential NIMs starting from 205410080
  const studentData: CreateStudentRequest[] = indonesianNames.map(
    (name, index) => ({
      full_name: name,
      nim: `${205410080 + index}`,
    }),
  );

  // Check existing students
  const existingCount = await prisma.student.count();
  if (existingCount >= 15) {
    console.log('Students already exist, seeding skipped.');
    return;
  }

  // Validate all data
  try {
    studentData.forEach((data) => {
      StudentValidation.CREATE.parse(data);
    });
  } catch (error) {
    throw new Error('Invalid student data: ' + error.message);
  }

  // Use transaction for safety
  await prisma.$transaction(async (tx) => {
    for (const data of studentData) {
      await tx.student.create({
        data: {
          full_name: data.full_name,
          nim: data.nim,
        },
      });
    }
  });

  console.log('Successfully created 15 student records!');
}

// Use IIFE to handle disconnect properly
void (async () => {
  try {
    await main();
  } catch (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
