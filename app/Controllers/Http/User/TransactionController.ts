
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TransactionService } from 'App/Services/Transaction'
import { HttpResponse } from 'App/Utils/HttpResponseUtil'

export default class TransactionClass {
  public async HTTPGetMyTransaction({auth, response, request}:HttpContextContract) {
    try {
     const resp = await TransactionService.GetAllUserTransaction(auth.user?.id as string, request.qs().page, request.qs().status)
      return HttpResponse({response, code: 200, message: resp.message, data: resp.data})
    } catch (error) {
     throw error
    }
  }
  public async HTTPGetMyTransactionStats({auth, response}: HttpContextContract) {
    try {

     const stats = await TransactionService.GetTransactionAnalytics(auth.user?.id)
      return HttpResponse({response, code: 200, message: stats.message, data: stats.data})
    } catch (error) {
     throw error
    }
  }
}


