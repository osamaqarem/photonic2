import type {
  ListObjectsV2CommandOutput,
  ObjectIdentifier,
} from "@aws-sdk/client-s3"
import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { Logger } from "@photonic/common"

import type { RoleCredentials } from "~/next/lib/validations/role-cred"

interface S3Config extends RoleCredentials {
  dev: boolean
  region: string
  bucket: string
}

export class S3 {
  private bucket: string
  private logger = new Logger("S3")

  private client: S3Client

  constructor({
    dev,
    AccessKeyId,
    SecretAccessKey,
    SessionToken,
    bucket,
    region,
  }: S3Config) {
    this.bucket = bucket
    if (!dev) {
      this.client = new S3Client({
        region,
        credentials: {
          accessKeyId: AccessKeyId,
          secretAccessKey: SecretAccessKey,
          sessionToken: SessionToken,
        },
      })
    } else {
      // @ts-expect-error no-op client
      this.client = {
        send: () => {
          return new Promise<AnyObject>(resolve => {
            setTimeout(() => {
              resolve({})
            }, Math.random() * (5000 - 2000) + 2000)
            // }, 0)
          })
        },
      }
    }
  }

  async listObjects(): Promise<ListObjectsV2CommandOutput> {
    try {
      this.logger.log("Listing objects")
      const data = await this.client.send(
        new ListObjectsV2Command({ Bucket: this.bucket }),
      )
      return data
    } catch (err) {
      throw new Error("listAllObjects", { cause: err })
    }
  }

  async uploadObject(key: string, file: Blob) {
    try {
      this.logger.log(`Uploading file ${key}`)
      const data = await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file,
        }),
      )

      return data
    } catch (err) {
      throw new Error("uploadObject", { cause: err })
    }
  }

  async deleteObjects(Objects: Array<ObjectIdentifier>): Promise<void> {
    try {
      this.logger.log("Deleting objects:", Objects)
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects,
          },
        }),
      )
    } catch (err) {
      throw new Error("deleteObjects", { cause: err })
    }
  }

  async copyObject(key: string, newKey: string): Promise<void> {
    try {
      this.logger.log(`Copying object ${key} to new key: ${newKey}`)

      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          Key: newKey,
          CopySource: `${this.bucket}/${key}`,
        }),
      )
    } catch (err) {
      throw new Error("copyObject", { cause: err })
    }
  }

  async getUploadUrl(key: string): Promise<string> {
    try {
      this.logger.log("Generating presigned upload url for:", key)
      const putObject = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
      return getSignedUrl(this.client, putObject, { expiresIn: 3600 })
    } catch (err) {
      throw new Error("getPresignedUrl", { cause: err })
    }
  }

  async getObjectUrl(key: string) {
    try {
      this.logger.log("Generating presigned get url for:", key)
      const getObject = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
      return getSignedUrl(this.client, getObject, { expiresIn: 3600 })
    } catch (err) {
      throw new Error("getPresignedUrl", { cause: err })
    }
  }
}
