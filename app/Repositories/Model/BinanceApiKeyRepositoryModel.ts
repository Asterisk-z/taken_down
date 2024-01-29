import { TCreateBinanceApiKey } from 'App/Shared/Types/Binance/BinanceApiKeyType'
import BinanceApiKeyRepositoryInterface from 'App/Repositories/Interfaces/BinanceApiKeyRepositoryInterface'
import BinanceApiKey from 'App/Models/BinanceApiKey'
import NotFoundException from 'App/Exceptions/NotFoundException'

export default class BinanceApiKeyRepositoryModel implements BinanceApiKeyRepositoryInterface {
  public async create(payload: TCreateBinanceApiKey): Promise<BinanceApiKey> {
    try {
      return BinanceApiKey.updateOrCreate(
        { apiSecret: payload.apiSecret, apiKey: payload.apiKey },
        payload
      )
    } catch (error) {
      throw error
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const binance = await BinanceApiKey.findOrFail(id)
      return binance.delete()
    } catch (error) {
      throw error
    }
  }

  public async getUserKey (userId: string) :Promise<BinanceApiKey>{
    try {
     const binance = await BinanceApiKey.query().where("userId", userId).first()
      if (!binance){ throw new NotFoundException("Binance has not been integrated")}
      return binance
    } catch (error) {
     throw error
    }
  }
}
