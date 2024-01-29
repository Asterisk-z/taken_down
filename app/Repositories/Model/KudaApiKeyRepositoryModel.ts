import { TCreateKudaApiKey } from 'App/Shared/Types/Kuda/KudaApiKeyType'
import KudaApiKeyRepositoryInterface from '../Interfaces/KudaApiKeyRepositoryInterface'
import KudaApiKey from 'App/Models/KudaApiKey'
import NotFoundException from 'App/Exceptions/NotFoundException'

export default class KudaApiKeyRepositoryModel implements KudaApiKeyRepositoryInterface {
  public async getUserApiKey(userId: string): Promise<KudaApiKey> {
    try {
      const kuda = await KudaApiKey.query().where("userId", userId).first()
      if(!kuda) {throw new NotFoundException("Kuda not connected")}
      return kuda
    } catch (error) {
     throw error
    }
  }
  public async create(payload: TCreateKudaApiKey): Promise<KudaApiKey> {
    try {
      return KudaApiKey.updateOrCreate({ email: payload.email }, payload)
    } catch (error) {
      throw error
    }
  }
}
