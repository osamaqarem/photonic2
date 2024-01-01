import {
  onlineManager,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import type { CreateTRPCClientOptions, TRPCLink } from "@trpc/client"
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import type { Unsubscribable } from "@trpc/server/observable"
import { observable } from "@trpc/server/observable"
import * as React from "react"

import { Logger } from "@photonic/common"
import type { AppRouter } from "@photonic/next/src/trpc/_app"
import { ApiError } from "@photonic/next/src/trpc/api-error"
import { config } from "~/expo/lib/config"
import { Network } from "~/expo/lib/network"
import type { AuthStore } from "~/expo/stores/auth-store"
import { useAuth } from "~/expo/stores/auth-store"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

const loggerLink: TRPCLink<AppRouter> = () => {
  const logger = new Logger("@trpc/client")

  return ({ next, op }) => {
    return observable(observer => {
      const req = `${op.id}:${op.path}`
      logger.log(`-> request(${req})`)
      const unsubscribe = next(op).subscribe({
        next: observer.next,
        complete() {
          logger.log(`<- resolved(${req})`)
          observer.complete()
        },
        error(err) {
          logger.error(`<- error(${req})`, err)
          observer.error(err)
        },
      })
      return unsubscribe
    })
  }
}

const httpLink = httpBatchLink({
  url: `${config.apiBaseUrl}/api/trpc`,
  async headers() {
    const { accessToken } = useAuth.getState()
    if (accessToken) {
      return {
        Authorization: `Bearer ${accessToken}`,
      }
    }
    return {}
  },
})

const authRefreshLink: TRPCLink<AppRouter> = () => {
  let authRefresh: Nullable<ReturnType<AuthStore["actions"]["maybeRefresh"]>> =
    null
  return ({ next, op }) => {
    return observable(observer => {
      let next$: Nullable<Unsubscribable> = null

      function makeRequest() {
        next$?.unsubscribe()
        next$ = next(op).subscribe({
          next: observer.next,
          complete: observer.complete,
          async error(err) {
            if (err.message !== ApiError.InvalidAccessToken) {
              observer.error(err)
            } else {
              const refresh = (refreshToken: string) =>
                trpcClient.auth.refresh.mutate({ refreshToken })

              authRefresh ??= useAuth.getState().actions.maybeRefresh(refresh)
              const outcome = await authRefresh

              if (outcome === "authorized") {
                // retry
                makeRequest()
              } else {
                authRefresh = null
                observer.error(err)
              }
            }
          },
        })
      }

      makeRequest()

      return () => {
        next$?.unsubscribe()
      }
    })
  }
}

const opts: CreateTRPCClientOptions<AppRouter> = {
  links: [loggerLink, authRefreshLink, httpLink],
}

export const trpcClient = createTRPCProxyClient<AppRouter>(opts)
export const trpc = createTRPCReact<AppRouter>()

export const TrpcProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [trpcReactClient] = React.useState(() => trpc.createClient(opts))

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        logger: new Logger("QueryClient"),
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
        queryCache: new QueryCache(),
      }),
  )

  React.useEffect(function configReactQuery() {
    onlineManager.setEventListener(reactQuerySetOnline => {
      return new Network().addEventListener(online => {
        reactQuerySetOnline(online)
        useAuth.getState().actions.setOnline(online)
      })
    })
  }, [])

  return (
    <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
