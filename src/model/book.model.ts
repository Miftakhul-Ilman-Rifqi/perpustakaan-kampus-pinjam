import { ApiProperty } from '@nestjs/swagger';

export class CreateBookRequest {
  @ApiProperty({
    description: 'Judul buku',
    example: 'Pemrograman NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'Stok buku',
    example: 10,
  })
  stock: number;
}

export class GetBookRequest {
  @ApiProperty({
    description: 'ID buku',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;
}

export class UpdateBookRequest {
  @ApiProperty({
    description: 'ID buku',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Judul buku',
    example: 'Pemrograman NestJS Updated',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Stok buku',
    example: 15,
    required: false,
  })
  stock?: number;
}

export class RemoveBookRequest {
  @ApiProperty({
    description: 'ID buku',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;
}

export class SearchBookRequest {
  @ApiProperty({
    description: 'Filter berdasarkan ID',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id?: string;

  @ApiProperty({
    description: 'Filter berdasarkan judul',
    required: false,
    example: 'Pemrograman',
  })
  title?: string;

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

export class BookResponse {
  @ApiProperty({
    description: 'ID buku',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Judul buku',
    example: 'Pemrograman NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'Stok buku',
    example: 10,
  })
  stock: number;
}
