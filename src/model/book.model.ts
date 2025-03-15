export class CreateBookRequest {
  title: string;
  stock: string;
}

export class GetBookRequest {
  id: string;
}

export class UpdateBookRequest {
  id: string;
  title: string;
  stock: string;
}

export class RemoveBookRequest {
  id: string;
}

export class SearchStudentRequest {
  id?: string;
  title?: string;
  page: number;
  size: number;
}

export class BookResponse {
  id: string;
  title: string;
  stock: string;
}
