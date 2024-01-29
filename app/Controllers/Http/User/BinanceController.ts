import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import { UserBinanceService } from 'App/Services/User/UserBinanceService'
import { HttpResponse } from 'App/Utils/HttpResponseUtil'
import { ConnectBinanceValidator } from 'App/Validators/BinanceValidator'

export default class BinanceController {
  public async connect({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(ConnectBinanceValidator)
    try {
      if (!auth.user) throw new ForbiddenException('User is forbidden')
      const user = auth.user
      const resp = await new UserBinanceService(user).connectBinance(payload.key, payload.secret)
      if (!resp.status) {
        return HttpResponse({
          response,
          code: 400,
          message: 'Unable to connect to Binance',
          data: resp.data,
        })
      }
      return HttpResponse({
        response,
        code: 200,
        message: 'Binance connected',
        data: resp.data,
      })
    } catch (error) {
      throw error
    }
  }

  public async showOrders({ response, auth }: HttpContextContract) {
    try {
      if (!auth.user) throw new ForbiddenException('User is forbidden')
      const user = auth.user
      const resp = await new UserBinanceService(user).getOpenOrders()
      return HttpResponse({
        response,
        code: 200,
        message: 'Open orders retrieved',
        data: resp.data,
      })
    } catch (error) {
      throw error
    }
  }

  public async GetUserBinanceDetails({response, auth}: HttpContextContract) {
    try {
      if(!auth.user){ throw new ForbiddenException("User is forbidden")}
      const resp = await new UserBinanceService(auth.user).GetUserBinance(auth.user.id)
      return HttpResponse({
        response,
        code:200,
        message: resp.message,
        data: resp.data
      })
    } catch (error) {
     throw error
    }
  }
}
