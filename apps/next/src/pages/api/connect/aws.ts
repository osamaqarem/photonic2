import { getErrorMsg, Logger } from "@photonic/common"
import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
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
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { context, event } = bodySchema.parse(req.body)
  logger.log("received cfn request:", req.body)

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
    // unhappy path
    if (event.RequestType === "Create") {
      // Failed to find user, refuse to create stack.
      logger.error(
        err,
        `Failed to find user, refusing to create stack. ExternalId: ${event.ResourceProperties.ExternalId}`,
      )

      body.Status = "FAILED"
      body.Reason = "User not found"
      await fetch(event.ResponseURL, getOptions(body)).catch(err => {
        // Sentry.captureException(err)
        logger.error("Create stack error (no user)", getErrorMsg(err))
      })
    } else {
      // Delete stack ('update' should also be fine), although user not found.
      logger.error(
        err,
        `Failed to find user, deleting cfn resource. ExternalId: ${event.ResourceProperties.ExternalId}`,
      )

      await fetch(event.ResponseURL, getOptions(body)).catch(err => {
        // Sentry.captureException(err)
        logger.error("Delete stack error. ", getErrorMsg(err))
      })
    }
    res.status(200).end()
    return
  }

  // happy path
  try {
    await fetch(event.ResponseURL, getOptions(body))
    logger.log(`completed operation: ${event.RequestType} for user: ${user.id}`)

    const { AwsAccountId, BucketName, Region, RoleArn } =
      event.ResourceProperties

    if (event.RequestType === "Create") {
      const newBucket = {
        userId: user.id,
        name: BucketName,
        region: Region,
        roleArn: RoleArn,
      }

      await db.awsAccount.upsert({
        where: {
          externalId: AwsAccountId,
        },
        create: {
          externalId: AwsAccountId,
          users: {
            connect: { id: user.id },
          },
          buckets: {
            create: newBucket,
          },
        },
        update: {
          buckets: {
            create: newBucket,
          },
          users: {
            connect: { id: user.id },
          },
        },
      })
      logger.log("saved aws account:", AwsAccountId, "for user:", user.id)
    } else if (event.RequestType === "Delete" && user.awsAccountId) {
      const awsAccount = await db.awsAccount.findFirstOrThrow({
        where: { id: user.awsAccountId },
        include: { buckets: { select: { id: true } } },
      })

      if (awsAccount.buckets.length > 1) {
        // delete aws account
        await db.user.update({
          where: { id: user.awsAccountId },
          data: {
            awsAccount: { delete: true },
            awsBucket: { delete: true },
          },
        })
      } else {
        // disconnect aws account relationship
        // delete bucket
        await db.user.update({
          where: { id: user.awsAccountId },
          data: {
            awsBucket: { delete: true },
            awsAccount: { disconnect: true },
          },
        })
      }
      logger.log("deleted aws account:", AwsAccountId, "for user:", user.id)
    }
  } catch (err) {
    const msg = `Something went wrong during ${event.RequestType} request for AwsAccount connection for user: ${user.id}`
    logger.error(msg, getErrorMsg(err))

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
