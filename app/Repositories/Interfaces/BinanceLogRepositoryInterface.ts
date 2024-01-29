import BinanceLog from 'App/Models/BinanceLog'
import { TCreateBinanceLog } from 'App/Shared/Types/Binance/BinanceLogType'

export default interface BinanceLogRepositoryInterface {
  create(payload: TCreateBinanceLog): Promise<BinanceLog>
}
