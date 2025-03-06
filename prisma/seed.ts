import { PrismaClient } from '@prisma/client';
import { SuperadminValidation } from '../src/superadmin/superadmin.validation'; // Pastikan path benar
import { RegisterSuperadminRequest } from '../src/model/superadmin.model';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Data Superadmin
  const data: RegisterSuperadminRequest = {
    username: 'rif123',
    password: 'perpuskampis',
    full_name: 'Miftakhul Ilman Rifqi',
  };

  // Validasi data menggunakan Zod
  try {
    SuperadminValidation.REGISTER.parse(data);
  } catch (error) {
    throw new Error('Data seeding tidak valid: ' + error.message);
  }

  // Cek apakah sudah ada Superadmin
  const existingCount = await prisma.superadmin.count();
  if (existingCount >= 1) {
    console.log('Superadmin sudah ada, seeding dibatalkan.');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Gunakan transaksi untuk keamanan
  await prisma.$transaction(async (tx) => {
    await tx.superadmin.create({
      data: {
        username: data.username,
        full_name: data.full_name,
        password: hashedPassword,
      },
    });
  });

  console.log('Superadmin berhasil dibuat!');
}

// Gunakan IIFE untuk menangani disconnect dengan benar
void (async () => {
  try {
    await main();
  } catch (e) {
    console.error('Error saat seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
