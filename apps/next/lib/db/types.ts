import type { User, AwsAccount } from "."

export interface UserWithAwsAccount extends User {
  awsAccount: AwsAccount
}
