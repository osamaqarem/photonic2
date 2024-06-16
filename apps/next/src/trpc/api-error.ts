export const enum ApiError {
  Unauthorized = "unauthorized",
  SessionExpired = "refresh_token_expired",
  MissingStorageCreds = "no_storage_account",
  AwsAssumeRoleFailed = "aws_impersonation_failed",
}
