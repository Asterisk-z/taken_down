import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import UnauthorizedException from 'App/Exceptions/UnauthorizedException'

export default class IsBinanceConnected {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!auth.user) throw new UnauthorizedException('You are not authorized')
    if (!auth.user.isBinanceConnected) throw new ForbiddenException('Binance account not connected')
    await next()
  }
}
