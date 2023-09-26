import {
  onlineManager,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import type { CreateTRPCClientOptions, TRPCLink } from "@trpc/client"
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import { observable } from "@trpc/server/observable"
import * as React from "react"

import { Logger } from "@photonic/common"
import type { AppRouter } from "~/next/trpc/_app"
import { config } from "~/expo/lib/config"
import { Network } from "~/expo/lib/network"

const loggerLink: TRPCLink<AppRouter> = () => {
  const logger = new Logger("trpc")

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

const opts: CreateTRPCClientOptions<AppRouter> = {
  links: [
    loggerLink,
    httpBatchLink({
      url: `${config.apiBaseUrl}/api/trpc`,
      async headers() {
        // const { accessToken } = useAuth.getState()
        // if (accessToken) {
        //   return {
        //     Authorization: `Bearer ${accessToken}`,
        //   }
        // }
        return {}
      },
    }),
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
        logger: new Logger("ReactQuery"),
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
        queryCache: new QueryCache(),
      }),
  )

  React.useEffect(function configReactQuery() {
    onlineManager.setEventListener(setOnline => {
      return new Network().addEventListener(online => {
        if (!online) {
          // useAuth.getState().actions.setOffline()
          setOnline(false)
        } else {
          setOnline(true)
        }
      })
    })
  }, [])

  return (
    <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
