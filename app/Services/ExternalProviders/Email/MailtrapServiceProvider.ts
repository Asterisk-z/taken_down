import Env from '@ioc:Adonis/Core/Env'
import { MailtrapClient } from 'mailtrap'
type TSendEmailInterface = {
  message: string
  recipient: string
  subject: string
}
export class MailtrapServiceProvider {
  private static MAILTRAP_SECRET_KEY: string = Env.get('MAILTRAP_SECRET_KEY')
  private static Mailtrap: MailtrapClient = new MailtrapClient({ token: this.MAILTRAP_SECRET_KEY })

  public static async sendEmail({ message, recipient, subject }: TSendEmailInterface) {
    try {
      const response = await this.Mailtrap.send({
        from: { name: 'Annonance Team', email: 'support@thedevhub.com.ng' },
        to: [{ email: recipient }],
        subject,
        text: message,
      })
      return response
    } catch (error) {
      throw error
    }
  }
}
