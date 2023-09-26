# Based on:
# https://github.com/vercel/turbo/blob/357cc37c905297e42a703f61228b946a5e9e761b/examples/with-docker/apps/web/Dockerfile

FROM node:16.17.0-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@photonic/next --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install
# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.json tsconfig.json
COPY .eslintrc.cjs .eslintrc.cjs
RUN yarn db:generate
RUN yarn turbo build --filter=@photonic/next...

FROM base AS runner
WORKDIR /app
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer /app/apps/next/next.config.js .
COPY --from=installer /app/apps/next/package.json .
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/next/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/next/.next/static ./apps/next/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/next/public ./apps/next/public
ENV NODE_ENV=production
CMD node apps/next/server.js