import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import { UserKudaService } from 'App/Services/User/UserKudaService'
import { HttpResponse } from 'App/Utils/HttpResponseUtil'
import {
  ConnectKudaValidator,
  QueryKudaAccountNumberValidator,
  QueryKudaTransactionHistoryValidator,
} from 'App/Validators/KudaValidator'

export default class KudaController {
  public async getUserAPIKey({ response, auth }: HttpContextContract) {
    try {
      const user = auth.user
      if (!user) {
        throw new ForbiddenException('Useer is forbidden')
      }

      const resp = await new UserKudaService(user).getUserKudaAPI(user.id)
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
  public async connect({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(ConnectKudaValidator)
    try {
      if (!auth.user) throw new ForbiddenException('User is forbidden')
      const user = auth.user
      const resp = await new UserKudaService(user).connectKuda({
        accountName: payload.accountName,
        accountNumber: payload.accountNumber,
        apiKey: payload.key,
        email: payload.email,
        narration: payload.narration,
        userId: user.id,
      })
      return HttpResponse({
        response,
        code: 200,
        message: 'Kuda connected',
        data: resp.data,
      })
    } catch (error) {
      throw error
    }
  }

  public async getMainWallet({ response, auth }: HttpContextContract) {
    try {
      if (!auth.user) throw new ForbiddenException('User is forbidden')
      const user = auth.user
      const resp = await new UserKudaService(user).getWallet()
      return HttpResponse({
        response,
        code: 200,
        message: 'Kuda main wallet retrieved',
        data: resp.data,
      })
    } catch (error) {
      throw error
    }
  }

  public async queryAccounNumber({ response, auth, request }: HttpContextContract) {
    const payload = await request.validate(QueryKudaAccountNumberValidator)
    try {
      if (!auth.user) throw new ForbiddenException('User is forbidden')
      const user = auth.user
      const resp = await new UserKudaService(user).queryAccountNumber(payload.acctNo)
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

  public async transactions({ response, auth, request }: HttpContextContract) {
    const payload = await request.validate(QueryKudaTransactionHistoryValidator)

    try {
      if (!auth.user) throw new ForbiddenException('User is forbidden')
      const user = auth.user
      const resp = await new UserKudaService(user).transactions({
        pageNumber: payload.page,
        pageSize: payload.perPage,
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
}
