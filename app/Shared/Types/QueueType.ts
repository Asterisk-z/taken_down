import User from 'App/Models/User'
import { TUserBinancePendingOrders } from 'App/Shared/Types/Binance/BinanceApiResponseType'

export type TQueuePayment = {
  payload: Array<TUserBinancePendingOrders>
  user: User
}
