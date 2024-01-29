import { AxiosHTTPClient } from 'App/Shared/HTTP/AxiosHTTP'
import Env from '@ioc:Adonis/Core/Env'
import KudaApiKey from 'App/Models/KudaApiKey'
import { KUDA_SERVICE_TYPE_ENUM } from 'App/Shared/Enums/KudaEmum'
import ServerException from 'App/Exceptions/ServerException'
import {
  TKudaBankListResponse,
  TKudaQueryBankDetailsResponse,
  TKudaUserWalletBalanceResponse,
  TFundTransferRequest,
  TFundTransferResponse,
  TTransactionHistoryResponse,
} from 'App/Shared/Types/Kuda/KudaType'

export class KudaServiceProvider {
  private KUDA_BASE_URL: string = Env.get('KUDA_BASE_URL')
  private headers: object = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  private kudaApiKey: KudaApiKey

  constructor(apikey: KudaApiKey) {
    this.kudaApiKey = apikey
  }

  public async getToken(): Promise<string> {
    try {
      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        data: { email: this.kudaApiKey.email, apiKey: this.kudaApiKey.apiKey },
        url: `${this.KUDA_BASE_URL}/Account/GetToken`,
        headers: this.headers,
      })
      return response as string
    } catch (error) {
      throw error
    }
  }

  public async getWalletBalance(reference: string) {
    try {
      const token = await this.getToken()
      this.headers['Authorization'] = `BEARER ${token}`
      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        data: {
          serviceType: KUDA_SERVICE_TYPE_ENUM.ADMIN_RETRIEVE_MAIN_ACCOUNT_BALANCE,
          requestRef: reference,
          data: {},
        },
        url: `${this.KUDA_BASE_URL}`,
        headers: this.headers,
      })
      if (!response.status) throw new ServerException(response.message)
      return response as TKudaUserWalletBalanceResponse
    } catch (error) {
      throw error
    }
  }

  public async bankList(reference: string): Promise<TKudaBankListResponse> {
    try {
      const token = await this.getToken()
      this.headers['Authorization'] = `BEARER ${token}`
      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        data: {
          serviceType: KUDA_SERVICE_TYPE_ENUM.BANK_LIST,
          requestRef: reference,
        },
        url: `${this.KUDA_BASE_URL}`,
        headers: this.headers,
      })
      return response as TKudaBankListResponse
    } catch (error) {
      throw error
    }
  }

  public async queryBankDetails({
    reference,
    accountNumber,
    bankCode,
  }: {
    reference: string
    accountNumber: string
    bankCode: string
  }): Promise<TKudaQueryBankDetailsResponse> {
    try {
      const token = await this.getToken()
      this.headers['Authorization'] = `BEARER ${token}`
      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        data: {
          serviceType: KUDA_SERVICE_TYPE_ENUM.NAME_ENQUIRY,
          requestRef: reference,
          data: {
            beneficiaryAccountNumber: accountNumber,
            beneficiaryBankCode: bankCode,
          },
        },
        url: `${this.KUDA_BASE_URL}`,
        headers: this.headers,
      })
      if (!response.status) throw new ServerException(response.message)
      return response as TKudaQueryBankDetailsResponse
    } catch (error) {
      throw error
    }
  }

  public async transactionStatus({
    reference,
    transactionReference,
    isThirdPartyBankTransfer,
  }: {
    reference: string
    transactionReference: string
    isThirdPartyBankTransfer: boolean
  }): Promise<string> {
    try {
      const token = await this.getToken()
      this.headers['Authorization'] = `BEARER ${token}`
      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        data: {
          serviceType: KUDA_SERVICE_TYPE_ENUM.TRANSACTION_STATUS_QUERY,
          requestRef: reference,
          data: {
            transactionRequestReference: transactionReference,
            isThirdPartyBankTransfer,
          },
        },
        url: `${this.KUDA_BASE_URL}`,
        headers: this.headers,
      })
      if (!response.status) throw new ServerException(response.message)
      return response.data
    } catch (error) {
      throw error
    }
  }

  public async singleFundTransfer(payload: TFundTransferRequest) {
    try {
      const token = await this.getToken()
      this.headers['Authorization'] = `BEARER ${token}`
      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        data: {
          serviceType: KUDA_SERVICE_TYPE_ENUM.SINGLE_FUND_TRANSFER,
          requestRef: payload.requestRef,
          data: {
            nameEnquirySessionID: payload.nameEnquirySessionID,
            clientAccountNumber: payload.clientAccountNumber,
            beneficiaryBankCode: payload.beneficiaryBankCode,
            beneficiaryAccount: payload.beneficiaryAccount,
            beneficiaryName: payload.beneficiaryName,
            narration: payload.narration,
            amount: payload.amount,
            trackingReference: payload.trackingReference,
            senderName: payload.senderName,
          },
        },
        url: `${this.KUDA_BASE_URL}`,
        headers: this.headers,
      })
      if (!response.status) throw new ServerException(response.message)
      return response as TFundTransferResponse
    } catch (error) {
      throw error
    }
  }

  public async transactions({
    reference,
    pageNumber,
    pageSize,
  }: {
    reference: string
    pageSize?: number
    pageNumber?: number
  }): Promise<TTransactionHistoryResponse> {
    try {
      const token = await this.getToken()
      this.headers['Authorization'] = `BEARER ${token}`
      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        data: {
          serviceType: KUDA_SERVICE_TYPE_ENUM.ADMIN_MAIN_ACCOUNT_TRANSACTIONS,
          requestRef: reference,
          data: {
            PageSize: pageSize ?? 1,
            PageNumber: pageNumber ?? 10,
          },
        },
        url: `${this.KUDA_BASE_URL}`,
        headers: this.headers,
      })
      if (!response.status) throw new ServerException(response.message)
      return response as TTransactionHistoryResponse
    } catch (error) {
      throw error
    }
  }
}
