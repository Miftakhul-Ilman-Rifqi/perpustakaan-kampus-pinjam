import { ApiProperty } from '@nestjs/swagger';

export class Paging {
  @ApiProperty({
    description: 'Jumlah item per halaman',
    example: 10,
  })
  size: number;

  @ApiProperty({
    description: 'Total halaman',
    example: 5,
  })
  total_page: number;

  @ApiProperty({
    description: 'Halaman saat ini',
    example: 1,
  })
  current_page: number;
}

export class WebResponse<T> {
  @ApiProperty({
    description: 'Data respons API',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Pesan error jika ada',
    required: false,
    example: 'Invalid credentials',
  })
  errors?: string;

  @ApiProperty({
    description: 'Informasi paginasi',
    required: false,
    type: Paging,
  })
  paging?: Paging;

  @ApiProperty({
    description: 'Pesan informasi tambahan',
    required: false,
    example: 'Operation successful',
  })
  message?: string;
}
