import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentRequest {
  @ApiProperty({
    description: 'Nama lengkap mahasiswa',
    example: 'Budi Santoso',
  })
  full_name: string;

  @ApiProperty({
    description: 'Nomor Induk Mahasiswa',
    example: '12345678',
  })
  nim: string;
}

export class GetStudentRequest {
  @ApiProperty({
    description: 'ID mahasiswa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;
}

export class StudentResponse {
  @ApiProperty({
    description: 'ID mahasiswa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nama lengkap mahasiswa',
    example: 'Budi Santoso',
  })
  full_name: string;

  @ApiProperty({
    description: 'Nomor Induk Mahasiswa',
    example: '12345678',
  })
  nim: string;
}

export class SearchStudentRequest {
  @ApiProperty({
    description: 'Filter berdasarkan nama lengkap',
    required: false,
    example: 'Budi',
  })
  full_name?: string;

  @ApiProperty({
    description: 'Filter berdasarkan NIM',
    required: false,
    example: '12345',
  })
  nim?: string;

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
