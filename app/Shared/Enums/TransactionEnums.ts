export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CANCELED: 'canceled',
  COMPLETED: 'completed',
} as const

export type TransactionStatusType = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]
