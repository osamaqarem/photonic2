import { config } from "~/next/config"
import { authedProcedure, router } from "../trpc"

export const userRouter = router({
  profile: authedProcedure.query(({ ctx }) => {
    return {
      email: ctx.user.email,
      aws: {
        connected: Boolean(ctx.user.awsAccount),
        disconnectUrl: config.AWS_CFN_URL,
        connectUrl: `${config.AWS_CFN_URL}?region=eu-central-1#/stacks/quickcreate?templateUrl=${config.AWS_CFN_TEMPLATE_URL}&stackName=PhotonicStack-${ctx.user.id}&param_PhotonicId=${ctx.user.id}`,
      },
    }
  }),
})
