export const enum ApiError {
  InvalidRefreshToken = "Refresh token expired",
  InvalidAccessToken = "Invalid access token",
  MissingStorageCreds = "Storage account not connected",
  AwsAssumeRoleFailed = "Assuming aws role failed",
}
