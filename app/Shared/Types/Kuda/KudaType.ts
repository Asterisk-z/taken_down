export type TKudaBankListResponse = {
  message: string
  status: boolean
  data: {
    banks: Array<{ bankCode: string; bankName: string }>
  }
}

export type TKudaQueryBankDetailsResponse = {
  message: string
  status: boolean
  data: {
    beneficiaryAccountNumber: string
    beneficiaryName: string
    senderAccountNumber: string
    senderName: null | string
    beneficiaryCustomerID: number
    beneficiaryBankCode: string
    nameEnquiryID: number
    responseCode: string
    transferCharge: number
    sessionID: string
  }
}

export type TKudaUserWalletBalanceResponse = {
  message: string
  status: boolean
  data: {
    ledgerBalance: number
    availableBalance: number
    withdrawableBalance: number
  }
}

export type TFundTransferRequest = {
  requestRef: string
  nameEnquirySessionID: string
  clientAccountNumber: string
  beneficiaryBankCode: string
  beneficiaryAccount: string
  beneficiaryName: string
  narration: string
  amount: number
  trackingReference: string
  senderName: string
}

export type TFundTransferResponse = {
  requestReference: string
  transactionReference: string
  instrumentNumber: null | string
  responseCode: string
  status: boolean
  message: string
  data: null | any
}

export type TTransactionHistoryResponse = {
  message: string
  status: boolean
  data: {
    postingsHistory: [
      {
        entryCode: string
        referenceNumber: string
        reversalReferenceNumber: null
        accountNumber: string
        linkedAccountNumber: null | string
        realDate: string
        amount: number
        openingBalance: number
        balanceAfter: number
        narration: string
        instrumentNumber: string
        postingRecordType: 1
        postedBy: string
        financialDate: string
        financialDateToBackdate: null | string
        ipAddress: null | string
        merchant: string
        recipientName: null | string
        senderName: null | string
        recipientBank: null | string
        senderBank: null | string
        userID: null | string
        hasCOTWaiver: boolean
        forceDebit: boolean
        transactionType: string
        postingType: number
        transactionMethod: number
        sessionId: string
        charge: number
        beneficiaryName: string
        allowChangeCategory: boolean
        categoryId: number
        categorySet: boolean
        tagId: number
        beneficiaryReference: string
        goalTitle: null | string
        phoneNumberRecharged: null | string
        billId: null | string
        tier0Waiver: boolean
        detailOfClosure: null | string
        reasonForClosure: null | string
        closedBy: null | string
        metaData: string
      },
    ]
    message: null | string
    statusCode: string
    totalRecordInStore: number
    totalDebit: number
    totalCredit: number
  }
}
