import User from 'App/Models/User'
import BinanceRepository from '@ioc:App/Repositories/BinanceApiKeyRepository'
import BinanceApiKeyRepositoryModel from 'App/Repositories/Model/BinanceApiKeyRepositoryModel'
import { BinanceServiceProvider } from 'App/Services/ExternalProviders/BinanceServiceProvider'
import { HelperUtil } from 'App/Utils/HelperUtil'
import { TServiceResponse } from 'App/Shared/Types/ServiceResponseType'
import BinanceLogRepositoryInterface from '@ioc:App/Repositories/BinanceLogRepository'
import BinanceLogRepositoryModel from 'App/Repositories/Model/BinanceLogRepositoryModel'
import BinanceApiKey from 'App/Models/BinanceApiKey'
import {
  TOrderDetailType,
  TUserBinancePendingOrders,
} from 'App/Shared/Types/Binance/BinanceApiResponseType'

export class UserBinanceService {
  constructor(user: User) {
    this.user = user
  }
  private user: User
  private binanceKeyId: string
  private binanceApiKeyRespository: BinanceRepository = new BinanceApiKeyRepositoryModel()
  private binanceLogRepository: BinanceLogRepositoryInterface = new BinanceLogRepositoryModel()

  public async GetUserBinance(userId: string): Promise<TServiceResponse<unknown>> {
    try {
      const binance = await this.binanceApiKeyRespository.getUserKey(userId)
      return {
        status: true,
        message: 'Binance API keys has been fetched successfully',
        data: { binance },
      }
    } catch (error) {
      throw error
    }
  }
  public async connectBinance(apiKey: string, apiSecret: string): Promise<TServiceResponse<any>> {
    try {
      const binanceKey = await this.binanceApiKeyRespository.create({
        userId: this.user.id,
        apiKey,
        apiSecret,
      })
      this.binanceKeyId = binanceKey.id
      await this.binanceService(binanceKey).connect()

      this.user.isBinanceConnected = true
      await this.user.save()

      return {
        status: true,
        message: 'Binance wallet connected',
        data: null,
      }
    } catch (error) {
      this.user.isBinanceConnected = false
      await this.user.save()
      await this.binanceApiKeyRespository.delete(this.binanceKeyId)
      throw error
    }
  }

  public async getOpenOrders() {
    try {
      await this.user.load('binanceKey')
      await this.user.load('kudaKey')
      const orders = await this.binanceService(this.user.binanceKey).openOrders()
      this.binanceLogRepository.create({
        userId: this.user.id,
        response: String(orders),
        request: 'get open order',
      })
      const orderDetails: TUserBinancePendingOrders[] = []
      for (const order of orders.data) {
        const detail = await this.getOrderDetails(order.orderNumber)
        const paymentMethods = detail.payMethods.filter((method) => method.identifier === 'BANK')
        const bankNameObject = paymentMethods[0].fields.find(
          (account) => account.fieldContentType === 'bank'
        )
        const bankAccountObject = paymentMethods[0].fields.find(
          (account) => account.fieldContentType === 'pay_account'
        )
        const bankAccNameObject = paymentMethods[0].fields.find(
          (account) => account.fieldContentType === 'payee'
        )
        orderDetails.push({
          orderNo: detail.orderNumber,
          status: 'pending',
          account: {
            bank: bankNameObject ? bankNameObject.fieldValue : undefined,
            number: bankAccountObject ? bankAccountObject.fieldValue : undefined,
            name: bankAccNameObject ? bankAccNameObject.fieldValue : undefined,
          },
          amount: Math.round(parseInt(detail.totalPrice)),
          createdAt: HelperUtil.convertToDateTimeFromMilliseconds(detail.createTime),
        })
      }

      return {
        status: true,
        message: 'All Open orders retrived',
        data: orderDetails,
      }
    } catch (error) {
      throw error
    }
  }

  private async getOrderDetails(orderNumber: string): Promise<TOrderDetailType> {
    try {
      await this.user.load('binanceKey')
      const details = await this.binanceService(this.user.binanceKey).orderDetails(orderNumber)
      return details.data
    } catch (error) {
      throw error
    }
  }

  private binanceService(binanceApiKey: BinanceApiKey): BinanceServiceProvider {
    return new BinanceServiceProvider(binanceApiKey)
  }
}
