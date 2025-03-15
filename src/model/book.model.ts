export class CreateBookRequest {
  title: string;
  stock: number;
}

export class GetBookRequest {
  id: string;
}

export class UpdateBookRequest {
  id: string;
  title?: string;
  stock?: number;
}

export class RemoveBookRequest {
  id: string;
}

export class SearchBookRequest {
  id?: string;
  title?: string;
  page: number;
  size: number;
}

export class BookResponse {
  id: string;
  title: string;
  stock: number;
}
