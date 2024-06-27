import { config } from "~/next/config"
import { authedProcedure, router } from "../trpc"

export const userRouter = router({
  profile: authedProcedure.query(({ ctx }) => {
    const stackName = `photonic-access-${ctx.user.id.replaceAll("_", "-")}`

    const awsAccountState = Boolean(ctx.user.awsAccount)
      ? ("connected" as const)
      : ("unavailable" as const)

    const toggleUrl =
      awsAccountState === "connected"
        ? config.AWS_CFN_URL
        : `${config.AWS_CFN_URL}?region=eu-central-1#/stacks/quickcreate?templateURL=${config.AWS_CFN_TEMPLATE_URL}&stackName=${stackName}&param_PhotonicId=${ctx.user.id}`

    return {
      email: ctx.user.email,
      aws: {
        status: awsAccountState,
        toggleUrl,
      },
    }
  }),
})
