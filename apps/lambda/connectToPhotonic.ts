import fetch from "node-fetch"

export const handler = async (event: unknown, context: unknown) => {
  if (!event || !context) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: {},
    }
  }

  await fetch(`${process.env.DOMAIN}/api/connect/aws`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event,
      context,
    }),
  }).catch(() => {})

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: {},
  }
}
