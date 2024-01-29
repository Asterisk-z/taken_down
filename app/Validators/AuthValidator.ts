import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class LoginAuthValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    email: schema.string({}, [rules.email()]),
    password: schema.string(),
  })

  public messages: CustomMessages = {
    'email.required': 'Email not provided',
    'password.required': 'Password not provided',
  }
}
