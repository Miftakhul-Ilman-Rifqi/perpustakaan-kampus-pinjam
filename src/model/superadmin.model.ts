import { ApiProperty } from '@nestjs/swagger';

export class RegisterSuperadminRequest {
  @ApiProperty({
    description: 'Username untuk superadmin',
    example: 'admin123',
  })
  username: string;

  @ApiProperty({
    description: 'Password untuk superadmin',
    example: 'strongpassword',
  })
  password: string;

  @ApiProperty({
    description: 'Nama lengkap superadmin',
    example: 'Admin Perpustakaan',
  })
  full_name: string;
}

export class SuperadminResponse {
  @ApiProperty({
    description: 'Username superadmin',
    example: 'admin123',
  })
  username: string;

  @ApiProperty({
    description: 'Nama lengkap superadmin',
    example: 'Admin Perpustakaan',
  })
  full_name: string;

  @ApiProperty({
    description: 'JWT token autentikasi',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token?: string;
}

export class LoginSuperadminRequest {
  @ApiProperty({
    description: 'Username untuk login',
    example: 'rif123',
  })
  username: string;

  @ApiProperty({
    description: 'Password untuk login',
    example: 'perpuskampis',
  })
  password: string;
}
