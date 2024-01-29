import { BackgroundJobs } from 'App/BackgroundJobs'
import { DateTime } from 'luxon'

BackgroundJobs.start().then(() =>
  console.log(`Cron started successfully as at ${DateTime.now().toFormat('yyyy-LL-dd hh:mm a')}`)
)
