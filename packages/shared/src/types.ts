export interface User {
  id: string;
  githubId: string | null;
  googleId: string | null;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
