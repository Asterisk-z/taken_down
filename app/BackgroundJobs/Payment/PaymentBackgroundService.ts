import UserRepository from '@ioc:App/Repositories/UserRepository'
import User from 'App/Models/User'
import UserRepositoryData from 'App/Repositories/Model/UserRepositoryModel'
import BullMQ from '@ioc:Adonis/Addons/BullMQ'
import { UserBinanceService } from 'App/Services/User/UserBinanceService'
import { QUEUE_NAME_ENUM } from 'App/Shared/Enums/QueueEnum'
import { TQueuePayment } from 'App/Shared/Types/QueueType'
import { TUserBinancePendingOrders } from 'App/Shared/Types/Binance/BinanceApiResponseType'
import { DateTime } from 'luxon'
import { SlackServiceProvider } from 'App/Services/ExternalProviders/SlackServiceProvider'
import Env from '@ioc:Adonis/Core/Env'

export class PaymentBackgroundService {
  private static userRespository: UserRepository = new UserRepositoryData()

  public static async processOrderPayment() {
    try {
      const users = await this.userRespository.getConnectedActiveUser()
      const ordersReceived: {
        user: User
        order: TUserBinancePendingOrders[]
      }[] = []

      for (const user of users) {
        const openOrders = await this.binanceServce(user).getOpenOrders()
        if (openOrders.data.length) {
          ordersReceived.push({
            user,
            order: openOrders.data,
          })
        }
      }

      const queue = BullMQ.queue<TQueuePayment, TQueuePayment>(QUEUE_NAME_ENUM.PROCESS_PAYMENT)
      for (const order of ordersReceived) {
        await queue.add(QUEUE_NAME_ENUM.PROCESS_PAYMENT, { payload: order.order, user: order.user })
      }

      const message = `A total number of ${
        ordersReceived.length
      } orders was received on *\`${Env.get(
        'NODE_ENV'
      )}\`* environment at ${DateTime.now().toFormat('yyyy-LL-dd hh:mm a')}`
      await SlackServiceProvider.sendMessageToChannel(message)
    } catch (error) {
      throw error
    }
  }

  private static binanceServce(user: User): UserBinanceService {
    return new UserBinanceService(user)
  }
}
