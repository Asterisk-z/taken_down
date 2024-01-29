import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { SlackServiceProvider } from 'App/Services/ExternalProviders/SlackServiceProvider'
import { UserService } from 'App/Services/User/UserService'
import { HttpResponse } from 'App/Utils/HttpResponseUtil'
import { AddUserValidator } from 'App/Validators/UserValidator'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const { email } = await request.validate(AddUserValidator)
    try {
      const resp = await UserService.addUser(email)
      await SlackServiceProvider.sendMessageToChannel(
        `You just added a new user with ${email} to your app. We will notify you once the user accepts`
      )
      return HttpResponse({
        response,
        code: 201,
        message: resp.message,
        data: resp.data,
      })
    } catch (error) {
      throw error
    }
  }
  public async index({ response, request }: HttpContextContract) {
    try {
      const users = await UserService.GetAllUser(request.qs().page)

      return HttpResponse({
        response,
        code: 200,
        message: users.message,
        data: {meta: users.data?.toJSON().meta, users:users.data?.toJSON().data},
      })
    } catch (error) {
      throw error
    }
  }
  public async show({ request, response }: HttpContextContract) {
    try {
      const user = await UserService.GetAUser(request.param('id'))
      return HttpResponse({ response, code: 200, message: user.message, data: user.data })
    } catch (error) {
      throw error
    }
  }
  public async ToggleUser({ request, response }: HttpContextContract) {
    try {
      const user = await UserService.ToggleUser(request.param('id'))
      return HttpResponse({ response, code: 200, message: user.message, data: user.data })
    } catch (error) {
      throw error
    }
  }
}
