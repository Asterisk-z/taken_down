export type TListOrdersType = {
  orderNumber: string
  advNo: string
  tradeType: string
  asset: string
  fiat: string
  fiatSymbol: string
  amount: string
  totalPrice: string
  orderStatus: number
  createTime: number
  currencyTicketSize: string
  assetTicketSize: string
  priceTicketSize: string
  sellerNickname: string
  buyerNickname: string
  notifyPayEndTime: string
  chatUnreadCount: number
  commissionRate: string
  commission: string
  takerCommissionRate: string
  takerCommission: string
  takerAmount: string
  tradeMethodCommissionRateVoList: [
    {
      tradeMethodIdentifier: string
      tradeMethodName: string
      commissionRate: string
    },
  ]
  additionalKycVerify: number
}
export type TOrderDetailType = {
  orderNumber: string
  advOrderNumber: string
  buyerMobilePhone: string
  sellerMobilePhone: string
  buyerNickname: string
  buyerName: string
  sellerNickname: string
  sellerName: string
  tradeType: string
  payType: string
  payMethods: [
    {
      id: number
      identifier: string
      tradeMethodName: string
      fields: [
        {
          fieldId: string
          fieldName: string
          fieldContentType: string
          restrictionType: number
          lengthLimit: number
          isRequired: boolean
          isCopyable: boolean
          fieldValue: string
        },
        {
          fieldId: string
          fieldName: string
          fieldContentType: string
          restrictionType: number
          lengthLimit: string
          isRequired: boolean
          isCopyable: boolean
          hintWord: string
          fieldValue: string
        },
        {
          fieldId: string
          fieldName: string
          fieldContentType: string
          restrictionType: number
          lengthLimit: number
          isRequired: boolean
          isCopyable: boolean
          hintWord: string
          fieldValue: string
        },
        {
          fieldId: string
          fieldName: string
          fieldContentType: string
          restrictionType: number
          lengthLimit: number
          isRequired: boolean
          isCopyable: boolean
          hintWord: string
          fieldValue: string
        },
      ]
      iconUrlColor: string
    },
  ]
  selectedPayId: number
  orderStatus: number
  asset: string
  amount: string
  price: string
  totalPrice: string
  fiatUnit: string
  isComplaintAllowed: boolean
  confirmPayTimeout: number
  remark: string
  createTime: number
  cancelTime: number
  notifyPayEndTime: number
  fiatSymbol: string
  currencyTicketSize: string
  assetTicketSize: string
  priceTicketSize: string
  notifyPayedExpireMinute: number
  confirmPayedExpireMinute: number
  currencyRate: string
  clientType: string
  onlineStatus: string
  merchantNo: string
  origin: string
  unreadCount: number
  iconUrl: string
  avgReleasePeriod: number
  avgPayPeriod: number
  expectedPayTime: number
  commissionRate: string
  commission: string
  takerCommissionRate: string
  takerCommission: string
  takerAmount: string
  tradeMethodCommissionRateVoList: [
    {
      tradeMethodIdentifier: string
      tradeMethodName: string
      commissionRate: string
    },
  ]
  additionalKycVerify: number
}
export type TUserBinancePendingOrders = {
  orderNo: string
  status: string
  account: {
    bank?: string
    number?: string
    name?: string
  }
  amount: number
  createdAt: string
}
