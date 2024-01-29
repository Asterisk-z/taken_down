import KudaLog from 'App/Models/KudaLog'
import { TCreateKudaLog } from 'App/Shared/Types/Kuda/KudaLogType'

export default interface KudaLogRepositoryInterface {
  create(payload: TCreateKudaLog): Promise<KudaLog>
}
