import { KudaServiceType } from 'App/Shared/Enums/KudaEmum'

export type TCreateKudaLog = {
  userId: string
  ref: string
  serviceType: KudaServiceType
  response: any
  isSuccess?: boolean
}
