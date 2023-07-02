# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=16.17.0

FROM node:${NODE_VERSION}-slim as base
LABEL fly_launch_runtime="Remix"
WORKDIR /app/temp
RUN yarn global add turbo
COPY --link . .
RUN turbo prune --scope="@photonic/remix" --docker


# Throw-away build stage to reduce size of final image
FROM base as build
WORKDIR /app/slim
# Install packages needed to build node modules
COPY --from=base --link /app/temp/out/json/ /app/temp/out/yarn.lock .
COPY --from=base --link /app/temp/out/full/ .
RUN yarn install --production=false && \
    yarn workspace @photonic/remix build && \
    yarn install --production=true && \
    yarn db:generate


# Final stage for app image
FROM node:${NODE_VERSION}-alpine as main
WORKDIR /app
# Copy built application
COPY --from=build --link /app/slim .
WORKDIR /app/apps/remix
# Set production environment
ENV NODE_ENV=production
# Start the server by default, this can be overwritten at runtime
CMD ["server.js"]
