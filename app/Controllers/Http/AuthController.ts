import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import { AuthService } from 'App/Services/AuthService'
import { HttpResponse } from 'App/Utils/HttpResponseUtil'
import { LoginAuthValidator } from 'App/Validators/AuthValidator'

export default class AuthController {
  public async login({ request, auth, response }: HttpContextContract) {
    const payload = await request.validate(LoginAuthValidator)
    try {
      const resp = await AuthService.login({
        email: payload.email,
        password: payload.password,
        auth,
      })
      return HttpResponse({
        response,
        code: 200,
        message: resp.message,
        data: resp.data,
      })
    } catch (error) {
      throw error
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    try {
      const resp = await AuthService.logout({ auth })
      return HttpResponse({
        response,
        code: 200,
        message: resp.message,
        data: resp.data,
      })
    } catch (error) {
      throw error
    }
  }

  public async show({ auth, response }: HttpContextContract) {
    try {
      if (!auth.user) throw new ForbiddenException('You are not logged in')
      const resp = await AuthService.user(auth.user.id)
      return HttpResponse({
        response,
        code: 200,
        message: resp.message,
        data: resp.data,
      })
    } catch (error) {
      throw error
    }
  }
}
