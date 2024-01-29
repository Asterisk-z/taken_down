import { TCreateBinanceLog } from 'App/Shared/Types/Binance/BinanceLogType'
import BinanceLogRepositoryInterface from 'App/Repositories/Interfaces/BinanceLogRepositoryInterface'
import BinanceLog from 'App/Models/BinanceLog'

export default class BinanceLogRepositoryModel implements BinanceLogRepositoryInterface {
  public async create(payload: TCreateBinanceLog): Promise<BinanceLog> {
    try {
      return BinanceLog.create(payload)
    } catch (error) {
      throw error
    }
  }
}
