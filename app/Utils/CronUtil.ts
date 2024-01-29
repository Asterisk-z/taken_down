import { CronShedule } from 'App/BackgroundJobs/CronScheduleEnum'
import { PaymentBackgroundService } from 'App/BackgroundJobs/Payment/PaymentBackgroundService'
import { DateTime } from 'luxon'
import cron from 'node-cron'
import Env from '@ioc:Adonis/Core/Env'

export class CronUtil {
  private static cronTime: string =
    Env.get('NODE_ENV') === 'development' ? CronShedule.MINUTES : CronShedule.MINUTES
  public static async runCronJobs() {
    cron.schedule(this.cronTime, () => {
      console.log(
        `Running Job at ${DateTime.now().toFormat('yyyy-LL-dd hh:mm a')} for ${
          PaymentBackgroundService.processOrderPayment.name
        }`
      )
      PaymentBackgroundService.processOrderPayment()
    })

    return true
  }
}
