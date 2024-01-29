export type TServiceResponse<T> = {
  status: boolean
  message: string
  data?: T | null
}
