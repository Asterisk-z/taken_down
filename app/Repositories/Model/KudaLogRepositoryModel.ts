import { TCreateKudaLog } from 'App/Shared/Types/Kuda/KudaLogType'
import KudaLogRepositoryInterface from 'App/Repositories/Interfaces/KudaLogRepositoryInterface'
import KudaLog from 'App/Models/KudaLog'

export default class KudaLogRepositoryModel implements KudaLogRepositoryInterface {
  public async create(payload: TCreateKudaLog): Promise<KudaLog> {
    try {
      return KudaLog.create(payload)
    } catch (error) {
      throw error
    }
  }
}
