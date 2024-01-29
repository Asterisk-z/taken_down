import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class ConnectBinanceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    secret: schema.string(),
    key: schema.string(),
  })

  public messages: CustomMessages = {
    'secret.required': 'Binance secrret key should be provided',
    'key.required': 'Provide your Binance api key',
  }
}
