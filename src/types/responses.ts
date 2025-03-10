export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
