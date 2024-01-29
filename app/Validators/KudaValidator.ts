import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class ConnectKudaValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email()]),
    key: schema.string(),
    accountNumber: schema.string(),
    narration: schema.string(),
    accountName: schema.string(),
  })

  public messages: CustomMessages = {
    'email.required': 'Provide your kuda registered email',
    'email.unique': 'This email is already connected with another account',
    'key.required': 'Provide your kuda api key',
    'accountNumber.required': 'Provide your kuda account number',
    'narration.required': 'Provide the narration to be used for transfer money',
    'accountName.required': 'Provide account name',
  }
}

export class QueryKudaAccountNumberValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    acctNo: schema.string({}, [rules.maxLength(10)]),
  })

  public messages: CustomMessages = {
    'acctNo.required': 'Kuda account number not provided',
    'acctNo.maxLength': 'Account number must not be greater than 10',
  }
}

export class QueryKudaTransactionHistoryValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    page: schema.number.optional(),
    perPage: schema.number.optional(),
  })

  public messages: CustomMessages = {
    'page.number': 'Page must be a number',
    'perPage.number': 'Per page must be a number',
  }
}
