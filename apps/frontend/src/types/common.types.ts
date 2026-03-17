export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  status: number;
  message: string;
  reason: string;
  data: T;
}

export interface ApiError {
  success: boolean;
  code: number;
  status: number;
  message: string;
  reason: string;
}
