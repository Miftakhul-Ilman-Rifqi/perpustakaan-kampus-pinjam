import { ApiProperty } from '@nestjs/swagger';
import { LoanStatus } from '@prisma/client';

export class CreateLoanRequest {
  @ApiProperty({
    description: 'Nomor Induk Mahasiswa peminjam',
    example: '12345678',
  })
  nim: string;

  @ApiProperty({
    description: 'ID buku yang dipinjam',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  bookId: string;
}

export class GetLoanRequest {
  @ApiProperty({
    description: 'ID peminjaman',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;
}

export class UpdateLoanRequest {
  @ApiProperty({
    description: 'ID peminjaman',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Status peminjaman',
    enum: LoanStatus,
    example: 'RETURNED',
  })
  status: LoanStatus;
}

export class RemoveLoanRequest {
  @ApiProperty({
    description: 'ID peminjaman',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;
}

export class SearchLoanRequest {
  @ApiProperty({
    description: 'Filter berdasarkan NIM',
    required: false,
    example: '12345',
  })
  nim?: string;

  @ApiProperty({
    description: 'Filter berdasarkan nama mahasiswa',
    required: false,
    example: 'Budi',
  })
  full_name?: string;

  @ApiProperty({
    description: 'Filter berdasarkan status',
    required: false,
    enum: LoanStatus,
    example: 'APPROVED',
  })
  status?: LoanStatus;

  @ApiProperty({
    description: 'Nomor halaman',
    example: 1,
    default: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: 10,
    default: 10,
  })
  size: number;
}

export class LoanResponse {
  @ApiProperty({
    description: 'ID peminjaman',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'NIM mahasiswa',
    example: '12345678',
  })
  nim: string;

  @ApiProperty({
    description: 'Nama lengkap mahasiswa',
    example: 'Budi Santoso',
  })
  full_name: string;

  @ApiProperty({
    description: 'Judul buku',
    example: 'Pemrograman NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'Status peminjaman',
    enum: LoanStatus,
    example: 'APPROVED',
  })
  status: LoanStatus;
}
