import { Logger } from "@photonic/common"
import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { cache } from "~/next/lib/cache"
import { db } from "~/next/lib/db"

const logger = new Logger("aws-connect")

interface CustomProviderResponse {
  Status: "SUCCESS" | "FAILED"
  Reason: string
  RequestId: string
  LogicalResourceId: string
  StackId: string
  PhysicalResourceId: string
}

/**
 * Planned paths:
 * - Happy: External User ID matches a user ID in our DB
 *    - The incoming request type is 'Create': create CFN stack and add AWS account to user in our db
 *    - The incoming request type is 'Delete': delete CFN resource and delete AWS account data from user in our db
 * - Sad: External User ID does not match a user ID in our DB.
 *    - The incoming request type is 'Create': refuse. we dont know who you are.
 *    - The incoming request type is 'Delete': likely a bug in our implementation that led the user to this state.
 *      perform the request to delete the resource.
 *
 *    TODO: delete user remote assets
 *    TODO: delete user bucket objects
 *
 *    Notes:
 *    - If the user has objects in their bucket, the bucket wont be deleted, and the cfn resource will fail to be removed.
 *      we remove their AWS account from our DB anyway.
 *
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { context, event } = bodySchema.parse(req.body)
  logger.log("received cfn request:", req.body)
  // const s: string = 123
  let body: CustomProviderResponse = {
    Status: "SUCCESS",
    Reason: "success",
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    StackId: event.StackId,
    PhysicalResourceId: context.awsRequestId,
  }
  const getOptions = (body: AnyObject) => ({
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  let user
  try {
    user = await db.user.findFirstOrThrow({
      where: { id: event.ResourceProperties.ExternalId },
    })
  } catch (err) {
    /**
     * Sad Path
     */
    if (event.RequestType === "Create") {
      // Failed to find user, refuse to create stack.
      logger.error(
        err,
        `Failed to find user, refusing to create stack. ExternalId: ${event.ResourceProperties.ExternalId}`,
      )

      body.Status = "FAILED"
      body.Reason = "User not found"
      await fetch(event.ResponseURL, getOptions(body)).catch(logger.error)
    } else {
      // Delete stack ('update' should also be fine), although user not found.
      logger.error(
        err,
        `Failed to find user, deleting cfn resource. ExternalId: ${event.ResourceProperties.ExternalId}`,
      )

      await fetch(event.ResponseURL, getOptions(body)).catch(logger.error)
    }
    res.status(200).end()
    return
  }

  /**
   * Happy Path
   */
  try {
    await fetch(event.ResponseURL, getOptions(body))
    logger.log(`completed operation: ${event.RequestType} for user: ${user.id}`)

    const { AwsAccountId, BucketName, Region, RoleArn } =
      event.ResourceProperties

    if (event.RequestType === "Create") {
      const awsAccount = await db.awsAccount.create({
        data: {
          id: AwsAccountId,
          userId: user.id,
          bucketName: BucketName,
          bucketRegion: Region,
          roleArn: RoleArn,
        },
      })
      logger.log("saved aws account:", AwsAccountId, "for user:", user.id)
      // Keep aws account in redis temporarily at least until the user refreshes their token
      // the refreshed token will contain the aws account info.
      cache.awsAccount.set(user, awsAccount)
    } else if (event.RequestType === "Delete") {
      await Promise.all([
        db.awsAccount
          .delete({
            where: {
              userId: user.id,
            },
          })
          .catch(logger.error),
        cache.awsAccount.delete(user),
      ])
      logger.log("deleted aws account:", AwsAccountId, "for user:", user.id)
    }
  } catch (err) {
    const msg = `Something went wrong during ${event.RequestType} request for AwsAccount connection for user: ${user.id}`
    logger.error(msg, err)

    body.Status = "FAILED"
    body.Reason = msg
    await fetch(event.ResponseURL, getOptions(body)).catch(logger.error)
  }

  res.status(200).end()
}

const bodySchema = z.object({
  context: z.object({
    awsRequestId: z.string(),
  }),
  event: z.object({
    RequestType: z.enum(["Delete", "Create"]),
    ResponseURL: z.string(),
    StackId: z.string(),
    RequestId: z.string(),
    LogicalResourceId: z.string(),
    ResourceProperties: z.object({
      AwsAccountId: z.string(),
      RoleArn: z.string(),
      ExternalId: z.string(),
      BucketName: z.string(),
      Region: z.string(),
    }),
  }),
})
