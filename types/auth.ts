export interface AuthTokenDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  userId: string;
  email: string;
  roles: string[];
}

export interface RegisterPendingDto {
  email: string;
  requiresVerification: boolean;
}

export interface MessageDto {
  message: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  displayName: string | null;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string | null;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RevokeTokenRequest {
  refreshToken: string;
}
