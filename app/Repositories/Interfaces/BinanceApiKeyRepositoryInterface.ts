import BinanceApiKey from 'App/Models/BinanceApiKey'
import { TCreateBinanceApiKey } from 'App/Shared/Types/Binance/BinanceApiKeyType'

export default interface BinanceApiKeyRepositoryInterface {
  create(payload: TCreateBinanceApiKey): Promise<BinanceApiKey>
  delete(id: string): Promise<void>
  getUserKey(userId: string):Promise<BinanceApiKey>
}
