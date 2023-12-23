import { config } from "~/next/config"
import { authedProcedure, router } from "../trpc"

export const userRouter = router({
  profile: authedProcedure.query(({ ctx }) => {
    const templatePath =
      config.STAGE === "production"
        ? "/template_production.json"
        : "/template_staging.json"

    const stackName = `photonic-access-${ctx.user.id.replaceAll("_", "-")}`

    return {
      email: ctx.user.email,
      aws: {
        connected: Boolean(ctx.user.awsAccount),
        disconnectUrl: config.AWS_CFN_URL,
        connectUrl: `${config.AWS_CFN_URL}?region=eu-central-1#/stacks/quickcreate?templateURL=${config.AWS_CFN_TEMPLATE_URL}${templatePath}&stackName=${stackName}&param_PhotonicId=${ctx.user.id}`,
      },
    }
  }),
})
