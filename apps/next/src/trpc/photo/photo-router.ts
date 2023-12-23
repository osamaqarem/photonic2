import type { ObjectIdentifier } from "@aws-sdk/client-s3"
import pMap from "p-map"
import { z } from "zod"

import { MediaType, type Photo } from "~/next/lib/db"
import { router } from "../trpc"
import { storageProcedure } from "./storage-procedure"

export const photoRouter = router({
  list: storageProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().catch(50),
        cursor: z.string().optional(), // -> Photo.id
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.photo.findMany({
        where: { userId: ctx.user.id },
        take: input.limit,
        skip: input.cursor ? 1 : 0,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: [{ creationTime: "desc" }, { name: "desc" }],
      })

      // set next cursor
      let nextCursor: Maybe<typeof input.cursor> = undefined
      if (items.length === input.limit) {
        const lastItem = items[input.limit - 1]
        nextCursor = lastItem ? lastItem.name : undefined
      }

      // set url for each item
      let withUrl: Array<Photo & { url: string }> = []
      const mapper = async (item: Photo) => {
        const url = await ctx.storage.getObjectUrl(item.name)
        withUrl.push({ ...item, url })
      }
      await pMap(items, mapper, { concurrency: 10 })

      return {
        assets: withUrl,
        nextCursor,
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
        id: z.string(),
        updatedData: z
          .object({
            name: z.string(),
            creationTime: z.number(),
          })
          .partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.updatedData.name) {
        await Promise.all([
          ctx.storage.copyObject(input.id, input.updatedData.name),
          ctx.storage.deleteObjects([{ Key: input.id }]),
        ])
      }

      await ctx.db.photo.update({
        where: { id: input.id },
        data: input.updatedData,
      })

      return
    }),
  put: storageProcedure
    .input(
      z.object({
        photos: z.array(
          z.object({
            name: z.string(),
            mediaType: z.enum([MediaType.photo, MediaType.video]),
            width: z.number(),
            height: z.number(),
            duration: z.number(),
            creationTime: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          photos: {
            createMany: {
              data: input.photos,
              skipDuplicates: true,
            },
          },
        },
      })
      return
    }),
  getSignedUploadUrl: storageProcedure
    .input(z.array(z.string()).min(1).max(10))
    .query(async ({ ctx, input }) => {
      return Promise.all(
        input.map(async item => {
          return ctx.storage.getUploadUrl(item)
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
