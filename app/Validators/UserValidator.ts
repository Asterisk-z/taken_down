import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class AddUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
  })

  public messages: CustomMessages = {
    'email.required': 'Email not provided',
    'email.unique': 'Email is already in use',
  }
}

export class CreateUserProfileValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    firstName: schema.string(),
    lastName: schema.string(),
    phoneNumber: schema.string({}, [rules.unique({ table: 'users', column: 'phone_number' })]),
    binanceUsername: schema.string(),
    password: schema.string(),
  })

  public messages: CustomMessages = {
    'password.required': 'Password not provided',
    'firstName.required': 'first name not provided',
    'lastName.required': 'last name not provided',
    'phoneNumber.required': 'Phone Number not provided',
    'binanceUsername.required': 'Binance username not provided',
    'phoneNumber.unique': 'Phone number is already in use',
  }
}

export class ResetPasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email()]),
    otp: schema.string(),
    password: schema.string()
  })

  public messages: CustomMessages = {
    'email.required': 'Email was not provided',
    'otp.required': 'Email was not provided',
    'password.required': 'Email was not provided',
  }
}

export class ForgotPasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email()])
  })

  public messages: CustomMessages = {
    'email.required': 'Email was not provided',
  }
}

export class VerifyPhoneNumberValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    otp: schema.string({}, [rules.maxLength(4)]),
  })

  public messages: CustomMessages = {
    'otp.required': 'OTP not provided',
    'otp.maxLength': 'OTP must be 4',
  }
}
