export const KUDA_SERVICE_TYPE_ENUM = {
  ADMIN_CREATE_VIRTUAL_ACCOUNT: 'ADMIN_CREATE_VIRTUAL_ACCOUNT',
  ADMIN_VIRTUAL_ACCOUNTS: 'ADMIN_VIRTUAL_ACCOUNTS',
  ADMIN_UPDATE_VIRTUAL_ACCOUNT: 'ADMIN_UPDATE_VIRTUAL_ACCOUNT',
  ADMIN_DISABLE_VIRTUAL_ACCOUNT: 'ADMIN_DISABLE_VIRTUAL_ACCOUNT',
  ADMIN_ENABLE_VIRTUAL_ACCOUNT: 'ADMIN_ENABLE_VIRTUAL_ACCOUNT',
  RETRIEVE_SINGLE_VIRTUAL_ACCOUNT: 'RETRIEVE_SINGLE_VIRTUAL_ACCOUNT',
  BANK_LIST: 'BANK_LIST',
  NAME_ENQUIRY: 'NAME_ENQUIRY',
  SINGLE_FUND_TRANSFER: 'SINGLE_FUND_TRANSFER',
  VIRTUAL_ACCOUNT_FUND_TRANSFER: 'VIRTUAL_ACCOUNT_FUND_TRANSFER',
  TRANSACTION_STATUS_QUERY: 'TRANSACTION_STATUS_QUERY',
  RETRIEVE_VIRTUAL_ACCOUNT_BALANCE: 'RETRIEVE_VIRTUAL_ACCOUNT_BALANCE',
  ADMIN_MAIN_ACCOUNT_TRANSACTIONS: 'ADMIN_MAIN_ACCOUNT_TRANSACTIONS',
  ADMIN_MAIN_ACCOUNT_FILTERED_TRANSACTIONS: 'ADMIN_MAIN_ACCOUNT_FILTERED_TRANSACTIONS',
  ADMIN_VIRTUAL_ACCOUNT_TRANSACTIONS: 'ADMIN_VIRTUAL_ACCOUNT_TRANSACTIONS',
  ADMIN_VIRTUAL_ACCOUNT_FILTERED_TRANSACTIONS: 'ADMIN_VIRTUAL_ACCOUNT_FILTERED_TRANSACTIONS',
  FUND_VIRTUAL_ACCOUNT: 'FUND_VIRTUAL_ACCOUNT',
  WITHDRAW_VIRTUAL_ACCOUNT: 'WITHDRAW_VIRTUAL_ACCOUNT',
  UPDATE_VIRTUAL_ACCOUNT_LIMIT: 'UPDATE_VIRTUAL_ACCOUNT_LIMIT',
  ADMIN_RETRIEVE_MAIN_ACCOUNT_BALANCE: 'ADMIN_RETRIEVE_MAIN_ACCOUNT_BALANCE',
} as const

export type KudaServiceType = (typeof KUDA_SERVICE_TYPE_ENUM)[keyof typeof KUDA_SERVICE_TYPE_ENUM]