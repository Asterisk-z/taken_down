import { TransactionStatusType } from '../Enums/TransactionEnums'

export type TCreateTransaction = {
  ref: string
  binanceOrderId: string
  requestRef: string
  accountName: string
  accountNumber: string
  bank: string
  bankCode: string
  bankCharges: number
  amount: number
  status: TransactionStatusType
  cancelationReason?: string
  currency?: string
  userId: string
  kudaTransactionReference: string
}
