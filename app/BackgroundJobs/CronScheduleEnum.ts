export enum CronShedule {
  DAILY = '0 0 * * *',
  WEEKLY = '0 0 * * 0',
  MONTHLY = '',
  MINUTES = '* * * * *',
  SECONDS = '* * * * * *',
  EVERY_FIVE_MINUTES = '*/5 * * * *',
}
