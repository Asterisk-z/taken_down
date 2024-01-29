import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import UnauthorizedException from 'App/Exceptions/UnauthorizedException'
import { USERTYPE } from 'App/Shared/Enums/UserEnum'

export default class IsAdmin {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!auth.user) throw new UnauthorizedException('You are not authorized')
    if (auth.user.type !== USERTYPE.ADMIN)
      throw new ForbiddenException('Action is forbidden for user')
    await next()
  }
}
