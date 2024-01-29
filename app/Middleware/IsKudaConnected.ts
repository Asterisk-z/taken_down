import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import UnauthorizedException from 'App/Exceptions/UnauthorizedException'

export default class IsKudaConnected {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!auth.user) throw new UnauthorizedException('You are not authorized')
    if (!auth.user.isKudaConnected) throw new ForbiddenException('Kuda account not connected')
    await next()
  }
}
