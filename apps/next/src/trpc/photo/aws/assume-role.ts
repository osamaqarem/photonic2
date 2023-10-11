import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts"
import type { AwsAccount } from "@prisma/client"

import { Logger } from "@photonic/common"

import { config } from "~/next/config"
import type { RoleCredentials } from "~/next/lib/validations/role-cred"
import { RoleCredentialsSchema } from "~/next/lib/validations/role-cred"

const logger = new Logger("AssumeRole")

const client = new STSClient({
  region: config.PHOTONIC_AWS_REGION,
  credentials: {
    accessKeyId: config.PHOTONIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: config.PHOTONIC_AWS_SECRET_KEY,
  },
})

export async function assumeRole(
  awsAccount: AwsAccount,
): Promise<RoleCredentials> {
  try {
    logger.log("Assuming direct control 🤖")
    const data = await client.send(
      new AssumeRoleCommand({
        RoleArn: awsAccount.roleArn,
        ExternalId: awsAccount.userId,
        RoleSessionName: "PhotonicAWSSession",
      }),
    )
    return RoleCredentialsSchema.parse(data.Credentials)
  } catch (err) {
    throw new Error("assumeRole", { cause: err })
  }
}
