import KudaApiKey from 'App/Models/KudaApiKey'
import { TCreateKudaApiKey } from 'App/Shared/Types/Kuda/KudaApiKeyType'

export default interface KudaApiKeyRepositoryInterface {
  create(payload: TCreateKudaApiKey): Promise<KudaApiKey>
  getUserApiKey(userId: string):Promise<KudaApiKey>
}
