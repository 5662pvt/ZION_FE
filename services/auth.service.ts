import { apiGet, apiPost } from "./apiClient";
import type {
  AuthTokenDto,
  AuthUserDto,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessageDto,
  RefreshTokenRequest,
  RegisterPendingDto,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  RevokeTokenRequest,
  VerifyEmailRequest,
} from "@/types/auth";

export const authService = {
  register: (body: RegisterRequest) =>
    apiPost<RegisterPendingDto>("/api/v1/auth/register", body).then((r) => r.data),

  verifyEmail: (body: VerifyEmailRequest) =>
    apiPost<AuthTokenDto>("/api/v1/auth/verify-email", body).then((r) => r.data),

  resendVerification: (body: ResendVerificationRequest) =>
    apiPost<MessageDto>("/api/v1/auth/resend-verification", body).then((r) => r.data),

  forgotPassword: (body: ForgotPasswordRequest) =>
    apiPost<MessageDto>("/api/v1/auth/forgot-password", body).then((r) => r.data),

  resetPassword: (body: ResetPasswordRequest) =>
    apiPost<MessageDto>("/api/v1/auth/reset-password", body).then((r) => r.data),

  login: (body: LoginRequest) => apiPost<AuthTokenDto>("/api/v1/auth/login", body).then((r) => r.data),

  refresh: (body: RefreshTokenRequest) =>
    apiPost<AuthTokenDto>("/api/v1/auth/refresh", body).then((r) => r.data),

  revoke: (body: RevokeTokenRequest) =>
    apiPost<null>("/api/v1/auth/revoke", body).then(() => undefined),

  me: () => apiGet<AuthUserDto>("/api/v1/auth/me").then((r) => r.data),

  changePassword: (body: ChangePasswordRequest) =>
    apiPost<AuthTokenDto>("/api/v1/auth/change-password", body).then((r) => r.data),
};
