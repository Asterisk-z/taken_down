import { CronUtil } from 'App/Utils/CronUtil'

export class BackgroundJobs {
  public static async start() {
    await CronUtil.runCronJobs()

    return true
  }
}
