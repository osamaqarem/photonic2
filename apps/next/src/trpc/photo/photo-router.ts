import type { ObjectIdentifier } from "@aws-sdk/client-s3"
import pMap from "p-map"
import { z } from "zod"

import { router } from "../trpc"
import { storageProcedure } from "./storage-procedure"

const optionalDate = (v: number | undefined) => (v ? new Date(v) : undefined)

export const photoRouter = router({
  list: storageProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(500).optional().catch(50),
        cursor: z.string().optional().describe("Asset ID"),
        createdAfterMs: z.number().optional(),
        createdBeforeMs: z.number().optional(),
        updatedAfterMs: z.number().optional(),
        updatedBeforeMs: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [count, items] = await ctx.db.$transaction([
        ctx.db.asset.count(),
        ctx.db.asset.findMany({
          where: {
            userId: ctx.user.id,
            creationTime: {
              gte: optionalDate(input.createdAfterMs),
              lt: optionalDate(input.createdBeforeMs),
            },
            modificationTime: {
              gte: optionalDate(input.updatedAfterMs),
              lt: optionalDate(input.updatedBeforeMs),
            },
          },
          take: input.limit,
          skip: input.cursor ? 1 : 0,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: [{ creationTime: "desc" }],
        }),
      ])

      // set next cursor
      let nextCursor: Maybe<typeof input.cursor> = undefined
      if (items.length === input.limit) {
        const lastItem = items[input.limit - 1]
        nextCursor = lastItem ? lastItem.id : undefined
      }

      return {
        assets: items,
        nextCursor,
        count,
      }
    }),
  delete: storageProcedure
    .input(
      z.object({
        names: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const awsObjects: Array<ObjectIdentifier> = input.names.map(Key => ({
        Key,
      }))
      await Promise.all([
        ctx.storage.deleteObjects(awsObjects),
        ctx.db.asset.deleteMany({
          where: {
            name: {
              in: input.names,
            },
          },
        }),
      ])
      return
    }),
  update: storageProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        updatedData: z
          .object({
            name: z.string(),
          })
          .partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.updatedData.name) {
        await Promise.all([
          ctx.storage.copyObject(input.name, input.updatedData.name),
          ctx.storage.deleteObjects([{ Key: input.name }]),
        ])
      }

      await ctx.db.asset.update({
        where: {
          id: input.id,
        },
        data: input.updatedData,
      })

      return
    }),
  // TODO: remove this endpoint, have the storage provider call the server with the data instead
  put: storageProcedure
    .input(
      z.object({
        photos: z
          .array(
            z.object({
              id: z.string(),
              deviceId: z.string(),
              name: z.string(),
              mediaType: z.union([z.literal("photo"), z.literal("video")]),
              width: z.number(),
              height: z.number(),
              duration: z.number(),
              creationTime: z.number(),
              modificationTime: z.number(),
            }),
          )
          .min(1)
          .max(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = input.photos.map(item => ({
        ...item,
        creationTime: new Date(item.creationTime),
        modificationTime: new Date(item.modificationTime),
      }))
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          assets: {
            createMany: {
              data,
              skipDuplicates: true,
            },
          },
        },
      })
      return
    }),
  getSignedUploadUrl: storageProcedure
    .input(
      z
        .array(
          z.object({ id: z.string(), localId: z.string(), name: z.string() }),
        )
        .min(1)
        .max(10),
    )
    .query(async ({ ctx, input }) => {
      return Promise.all(
        input.map(async item => {
          const url = await ctx.storage.getUploadUrl(item.localId)
          return {
            ...item,
            url,
          }
        }),
      )
    }),
  getSignedUrl: storageProcedure
    .input(z.array(z.string()).min(1).max(15))
    .query(async ({ ctx, input }): Promise<Array<string>> => {
      let data: Array<string> = []
      const mapper = async (name: string) => {
        const url = await ctx.storage.getObjectUrl(name)
        data.push(url)
      }
      await pMap(input, mapper, { concurrency: 10 })
      return data
    }),
})
