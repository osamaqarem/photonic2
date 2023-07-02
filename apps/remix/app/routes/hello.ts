import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const name = url.searchParams.get("name") || "World"
  return json({ message: `Hello, ${name}!`, env: process.env.NODE_ENV })
}
