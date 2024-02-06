import type { ObjectIdentifier } from "@aws-sdk/client-s3"
import pMap from "p-map"
import { z } from "zod"

import { MediaType, type Photo } from "~/next/lib/db"
import { router } from "../trpc"
import { storageProcedure } from "./storage-procedure"

const optionalDate = (v: number | undefined) => (v ? new Date(v) : undefined)

export const photoRouter = router({
  list: storageProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().catch(50),
        cursor: z.string().optional().describe("Asset ID"),
        createdAfterMs: z.number().optional(),
        createdBeforeMs: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log("photoRouter.list", "cursor:" + input.cursor)
      const [count, items] = await ctx.db.$transaction([
        ctx.db.photo.count(),
        ctx.db.photo.findMany({
          where: {
            userId: ctx.user.id,
            creationTime: {
              gte: optionalDate(input.createdAfterMs),
              lt: optionalDate(input.createdBeforeMs),
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

      // set url for each item
      let withUrl: Array<
        Photo & { url: string; type: "remote"; creationTime: Date }
      > = []
      const mapper = async (item: Photo) => {
        const url = await ctx.storage.getObjectUrl(item.name)
        withUrl.push({
          ...item,
          url,
          type: "remote",
          creationTime: item.creationTime,
        })
      }
      await pMap(items, mapper, { concurrency: 10 })

      return {
        assets: withUrl,
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
        ctx.db.photo.deleteMany({
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

      await ctx.db.photo.update({
        where: {
          photoId: {
            name: input.name,
            userId: ctx.user.id,
          },
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
              name: z.string(),
              mediaType: z.enum([MediaType.photo, MediaType.video]),
              width: z.number(),
              height: z.number(),
              duration: z.number(),
              creationTime: z.date(),
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
      }))
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          photos: {
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
        .array(z.object({ name: z.string(), localId: z.string() }))
        .min(1)
        .max(10),
    )
    .query(async ({ ctx, input }) => {
      return Promise.all(
        input.map(async item => {
          const url = await ctx.storage.getUploadUrl(item.name)
          return {
            ...item,
            url,
          }
        }),
      )
    }),
  getSignedUrl: storageProcedure
    .input(z.array(z.string()).min(1).max(15))
    .query(async ({ ctx, input }): Promise<Record<string, string>> => {
      let result: Record<string, string> = {}
      const mapper = async (name: string) => {
        const url = await ctx.storage.getObjectUrl(name)
        result[name] = url
      }
      await pMap(input, mapper, { concurrency: 10 })
      return result
    }),
})
