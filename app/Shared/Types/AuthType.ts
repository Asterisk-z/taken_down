import { AuthContract } from '@ioc:Adonis/Addons/Auth'

export type TLogin = {
  email: string
  password: string
  auth: AuthContract
}

export type TLogout = {
  auth: AuthContract
}
