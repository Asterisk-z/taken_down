import Env from '@ioc:Adonis/Core/Env'
import { AxiosHTTPClient } from 'App/Shared/HTTP/AxiosHTTP'
type TSendSMSInterface = {
  message: string
  recipient: string[]
}
export class SendchampServiceProvider {
  private static SENDCHAMP_BASE_URL: string = Env.get('SENDCHAMP_BASE_URL')
  private static SENDCHAMP_SECRET_KEY: string = `Bearer sendchamp_live_$2a$10$.${Env.get(
    'SENDCHAMP_LIVE_SECRET_KEY'
  )}`
  private static SENDECHAMP_SMS_ROUTE: string = Env.get('SENDCHAMP_SMS_ROUTE')
  private static SENDECHAMP_SENDER_NAME: string = Env.get('SENDCHAMP_SENDER_NAME')
  private static headers: object = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${this.SENDCHAMP_SECRET_KEY}`,
  }

  public static async sendSMS({ message, recipient }: TSendSMSInterface) {
    try {
      const payload = {
        message,
        to: recipient,
        sender_name: this.SENDECHAMP_SENDER_NAME,
        route: this.SENDECHAMP_SMS_ROUTE,
      }

      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        data: payload,
        url: `${this.SENDCHAMP_BASE_URL}/sms/send`,
        headers: this.headers,
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
