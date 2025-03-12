export class CreateStudentRequest {
  full_name: string;
  nim: string;
}

export class GetStudentRequest {
  id: string;
}

export class StudentResponse {
  id: string;
  full_name: string;
  nim: string;
}

export class SearchStudentRequest {
  full_name?: string;
  nim?: string;
  page: number;
  size: number;
}
