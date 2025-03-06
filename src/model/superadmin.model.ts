export class RegisterSuperadminRequest {
  username: string;
  password: string;
  full_name: string;
}

export class SuperadminResponse {
  username: string;
  full_name: string;
  token?: string;
}

export class LoginSuperadminRequest {
  username: string;
  password: string;
}
