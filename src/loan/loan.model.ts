import { LoanStatus } from '@prisma/client';

export class CreateLoanRequest {
  nim: string;
  bookId: string;
}

export class GetLoanRequest {
  id: string;
}

export class UpdateLoanRequest {
  id: string;
  status: LoanStatus;
}

export class RemoveLoanRequest {
  id: string;
}

export class SearchLoanRequest {
  nim?: string;
  full_name?: string;
  status?: LoanStatus;
  page: number;
  size: number;
}

export class LoanResponse {
  id: string;
  nim: string;
  full_name: string;
  title: string;
  status: LoanStatus;
}
