import type { User, AwsAccount } from "."

export interface UserJoinAwsAccount extends User {
  awsAccount: AwsAccount | null
}
