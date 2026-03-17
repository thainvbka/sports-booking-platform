import type { User } from "./user.types";

export interface AuthUserData {
  user: User;
  accessToken: string;
}

export interface RegisterData {
  needVerify: boolean;
}

export interface ForgotPasswordData {
  message: string;
}
