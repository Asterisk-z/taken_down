/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local'] as const),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test', 'staging'] as const),
  SENDCHAMP_BASE_URL: Env.schema.string({ format: 'url' }),
  SENDCHAMP_SMS_ROUTE: Env.schema.string(),
  SENDCHAMP_SENDER_NAME: Env.schema.string(),
  SENDCHAMP_LIVE_SECRET_KEY: Env.schema.string(),
  MAILTRAP_SECRET_KEY: Env.schema.string(),
  MAILTRAP_BASE_URL: Env.schema.string({ format: 'url' }),
  ADMIN_EMAIL: Env.schema.string(),
  ADMIN_PASSWORD: Env.schema.string(),
  KUDA_BASE_URL: Env.schema.string({ format: 'url' }),
  BINANCE_BASE_URL: Env.schema.string({ format: 'url' }),
  BULLMQ_REDIS_HOST: Env.schema.string(),
  BULLMQ_REDIS_PORT: Env.schema.number(),
  BULLMQ_REDIS_PASSWORD: Env.schema.string(),
  SMTP_HOST: Env.schema.string({ format: 'host' }),
  SMTP_USERNAME: Env.schema.string({ format: 'email' }),
  SMTP_PASSWORD: Env.schema.string(),
  SLACK_SIGNIN_SECRET: Env.schema.string(),
  SLACK_BOT_TOKEN: Env.schema.string(),
  SLACK_CHANNEL: Env.schema.string(),
})
