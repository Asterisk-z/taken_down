export const QUEUE_NAME_ENUM = {
  PROCESS_PAYMENT: 'process_payment',
} as const

export type QueueNameType = (typeof QUEUE_NAME_ENUM)[keyof typeof QUEUE_NAME_ENUM]
