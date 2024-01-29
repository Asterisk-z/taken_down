import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import crypto from 'crypto'
import BadRequestException from 'App/Exceptions/BadRequestException'
import { DateTime } from 'luxon'

export class HelperUtil {
  public static generateAlphaNumeric(codeLength: number = 8): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789' // Define a character pool
    let code = ''
    const characterCount = characters.length

    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characterCount)
      code += characters.charAt(randomIndex)
    }
    return code
  }

  public static generateNumeric(codeLength: number = 8): string {
    const characters = '0123456789' // Define a character pool
    let code = ''
    const characterCount = characters.length

    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characterCount)
      code += characters.charAt(randomIndex)
    }
    return code
  }

  public static async generateUserRef(): Promise<string> {
    const code = this.generateNumeric(6)
    let existingRef = await User.query().where('anonance_id', code).first()
    while (existingRef) {
      const ref = this.generateAlphaNumeric()
      existingRef = await User.query().where('anonance_id', ref).first()
    }
    return `an${code}`
  }

  public static encrypt(text: any): string {
    const key = Env.get('APP_KEY')
    const iv = crypto.randomBytes(16) // Generate a random initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + encrypted
  }

  public static decrypt(encryptedText: string): string {
    try {
      const key = Env.get('APP_KEY')
      const iv = Buffer.from(encryptedText.slice(0, 32), 'hex') // Extract the initialization vector
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
      let decrypted = decipher.update(encryptedText.slice(32), 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (error) {
      throw new BadRequestException('Invalid encryption data')
    }
  }

  public static convertToDateTimeFromMilliseconds(
    milliseconds: number,
    format: string = 'yyyy-LL-dd hh:mm a'
  ): string {
    const dateTime = DateTime.fromMillis(milliseconds)
    const formattedDateTime = dateTime.toFormat(format)
    return formattedDateTime
  }

  public static getTransactionType(input: string): string {
    return input.toLowerCase().startsWith('d')
      ? 'Debit'
      : input.toLowerCase().startsWith('c')
        ? 'Credit'
        : 'N.R'
  }
}
