import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { TransactionService } from "App/Services/Transaction";
import { TCreateTransaction } from "App/Shared/Types/TransactionType";
import { HttpResponse } from "App/Utils/HttpResponseUtil";

export default class TransactionController {
  public async HTTPSearchTransaction(
    { request, response }: HttpContextContract,
  ) {
    try {
      const resp = await TransactionService.SearchTransaction({
        ...request.qs(),
      });

      return HttpResponse({
        response,
        code: 200,
        message: resp.message,
        data: resp.data,
      });
    } catch (error) {
      throw error;
    }
  }
  public async HTTPCreateTransaction(
    { request, response }: HttpContextContract,
  ) {
    try {
      const transaction = await TransactionService.CreateTransaction({
        ...request.body() as TCreateTransaction,
      });
      return HttpResponse({
        response,
        code: 201,
        message: transaction.message,
        data: transaction.data,
      });
    } catch (error) {
      throw error;
    }
  }
  public async HTTPGetAllTransaction(
    { request, response }: HttpContextContract,
  ) {
    try {
      const resp = await TransactionService.GetAllTransactions(
        request.qs().status,
        request.qs().page,
      );

      return HttpResponse({
        response,
        code: 200,
        message: resp.message,
        data: resp.data,
      });
    } catch (error) {
      throw error;
    }
  }

  public async HTTPGetUserTransactin(
    { request, response }: HttpContextContract,
  ) {
    try {
      const resp = await TransactionService.GetAllUserTransaction(
        request.qs().userId,
      );

      return HttpResponse({
        response,
        code: 200,
        message: resp.message,
        data: resp.data,
      });
    } catch (error) {
      throw error;
    }
  }

  public async HTTPGetATransaction({ request, response }: HttpContextContract) {
    try {
      const resp = await TransactionService.GetATransaction(
        request.param("id"),
      );

      return HttpResponse({
        response,
        code: 200,
        message: resp.message,
        data: resp.data,
      });
    } catch (error) {
      throw error;
    }
  }

  public async HTTPGetTransactionAnalytics({ response }: HttpContextContract) {
    try {
      const resp = await TransactionService.GetTransactionAnalytics();

      return HttpResponse({
        response,
        code: 200,
        message: resp.message,
        data: resp.data,
      });
    } catch (error) {
      throw error;
    }
  }

  public async HTTPGetUserTransactionOverview(
    { request, response }: HttpContextContract,
  ) {
    try {
      const overview = await TransactionService.GetUserTransactionOverview(
        request.qs().userId,
        request.qs().page,
      );

      return HttpResponse({
        response,
        code: 200,
        message: overview.message,
        data: overview.data,
      });
    } catch (error) {
      throw error;
    }
  }
}
