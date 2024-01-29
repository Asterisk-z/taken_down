import nodemailer from 'nodemailer'
import Env from '@ioc:Adonis/Core/Env'
export class NodeMailerServiceProvider {
  private static Username: string = Env.get('SMTP_USERNAME')
  private static Password: string = Env.get('SMTP_PASSWORD')
  private static Host: string = Env.get('SMTP_HOST')
  private static Transporter = nodemailer.createTransport({
    host: this.Host,
    port: 465,
    secure: true, // `true` for port 465, `false` for all other ports
    auth: {
      user: this.Username,
      pass: this.Password,
    },
  })

  public static async send({
    recipient,
    message,
    subject,
  }: {
    recipient: string
    message: string
    subject: string
  }) {
    // send mail with defined transport object
    const info = await this.Transporter.sendMail({
      from: `"Anonnace" <${this.Username}>`, // sender address
      to: recipient, // list of receivers separated by comma
      subject, // Subject line
      html: `<p>${message}</p>`, // html body
    })
    return info
  }
}
