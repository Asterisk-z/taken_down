import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import { UserService } from 'App/Services/User/UserService'
import { TCreateProfile } from 'App/Shared/Types/UserRequestType'
import { HttpResponse } from 'App/Utils/HttpResponseUtil'
import {
  CreateUserProfileValidator,
  ForgotPasswordValidator,
  ResetPasswordValidator,
  VerifyPhoneNumberValidator,
} from 'App/Validators/UserValidator'

export default class UsersController {
  public async createProfile({ request, response, auth }: HttpContextContract) {
    const validatePayload = await request.validate(CreateUserProfileValidator)
    try {
      if (!auth.user) throw new ForbiddenException('You are not logged in')
      if (!auth.user.isFirstLogin) throw new ForbiddenException('Not a first time login')
      const payload: TCreateProfile = {
        ...validatePayload,
        otp: '',
        id: auth.user.id,
      }

      const resp = await UserService.createProfile(payload)
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

  public async verifyPhoneNumber({ request, response, auth }: HttpContextContract) {
    const { otp } = await request.validate(VerifyPhoneNumberValidator)
    try {
      if (!auth.user) throw new ForbiddenException('You are not logged in')
      const resp = await UserService.verifyPhoneNumber(auth.user.id, otp)
      auth.use('api').revoke()
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

  public async UserForgotPassword({request, response}: HttpContextContract) {
    try {
     const  {email} = await request.validate(ForgotPasswordValidator)

      console.log(request.qs())
      const resp = await UserService.ForgotPassword(email)
      return HttpResponse({response, code: 200, message: "OTP has been sent to your mail", data: resp.data})
    } catch (error) {
     throw error
    }
  }
  public async UserResetPassword({request, response}: HttpContextContract) {
    try {
      const {email,otp,password} = await request.validate(ResetPasswordValidator)

      const resp = await UserService.ResetPassword(email, otp, password)

      return HttpResponse({
        response,
        message: resp.message,
        code:200,
        data: resp.data
      })
    } catch (error) {
     throw error
    }
  }
}

