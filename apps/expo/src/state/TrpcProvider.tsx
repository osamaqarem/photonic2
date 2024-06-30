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
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { config } from "~/expo/lib/config"
import { Network } from "~/expo/lib/network"
import { useAuth } from "~/expo/state/auth-store"

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

const createLoggerLink: (logger: Logger) => TRPCLink<AppRouter> =
  logger => () => {
    return ({ next, op }) => {
      return observable(observer => {
        const req = `${op.id}:${op.path}`
        logger.log(`-> request(${req})`)
        const unsubscribe = next(op).subscribe({
          next: observer.next,
          complete() {
            logger.log(`<- resolved(${op.id}:${op.path})`)
            observer.complete()
          },
          error(err) {
            logger.error(`<- error(${op.id}:${op.path})`, err)
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

// Reference
// https://github.com/pyncz/trpc-refresh-token-link/blob/main/src/index.ts
const authRefreshLink: TRPCLink<AppRouter> = () => {
  let authRefresh: Nullable<Promise<void>> = null
  return ({ next, op }) => {
    return observable(observer => {
      let next$: Nullable<Unsubscribable> = null

      const makeRequest = () => {
        next$?.unsubscribe()
        next$ = next(op).subscribe({
          next: observer.next,
          complete: observer.complete,
          async error(err) {
            if (err.message !== ApiError.Unauthorized) {
              observer.error(err)
              return
            } else {
              const { refreshToken, actions } = useAuth.getState()
              if (!refreshToken) {
                observer.error(err)
                return
              }

              authRefresh = (async () => {
                try {
                  const result = await trpcClient.auth.refresh.mutate({
                    refreshToken,
                  })
                  actions.signIn({ ...result, refreshToken })
                } catch {
                  useAuth.getState().actions.signOut()
                } finally {
                  authRefresh = null
                }
              })()

              await authRefresh

              // retry original request
              makeRequest()
            }
          },
        })
      }

      const refreshPromise = authRefresh ?? Promise.resolve()
      refreshPromise.finally(() => {
        makeRequest()
      })

      return () => {
        next$?.unsubscribe()
      }
    })
  }
}

const opts: CreateTRPCClientOptions<AppRouter> = {
  links: [
    createLoggerLink(new Logger("@trpc/client")),
    authRefreshLink,
    httpLink,
  ],
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
