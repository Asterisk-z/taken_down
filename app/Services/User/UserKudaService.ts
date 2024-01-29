import User from 'App/Models/User'
import KudaRepository from '@ioc:App/Repositories/KudaApiKeyRepository'
import KudaApiKeyRepositoryModel from 'App/Repositories/Model/KudaApiKeyRepositoryModel'
import { KudaServiceProvider } from 'App/Services/ExternalProviders/KudaServiceProvider'
import KudaApiKey from 'App/Models/KudaApiKey'
import { HelperUtil } from 'App/Utils/HelperUtil'
import { TServiceResponse } from 'App/Shared/Types/ServiceResponseType'
import KudaLogRepositoryInterface from '@ioc:App/Repositories/KudaLogRepository'
import KudaLogRepositoryModel from 'App/Repositories/Model/KudaLogRepositoryModel'
import BadRequestException from 'App/Exceptions/BadRequestException'
import { KUDA_SERVICE_TYPE_ENUM } from 'App/Shared/Enums/KudaEmum'
import { TCreateKudaApiKey } from 'App/Shared/Types/Kuda/KudaApiKeyType'
import { DateTime } from 'luxon'

const HandleKudaError = (error: any) => {
  if (error.code === 'ERR_BAD_RESPONSE' || error.code === 'ERR_BAD_REQUEST') {
    throw new BadRequestException('Invalid api key provided')
  }
  throw error
}

export class UserKudaService {
  constructor(user: User) {
    this.user = user
  }
  private user: User
  private kudaApiKeyRespository: KudaRepository = new KudaApiKeyRepositoryModel()
  private kudaLogRepository: KudaLogRepositoryInterface = new KudaLogRepositoryModel()

  public async getUserKudaAPI(userId: string): Promise<TServiceResponse<unknown>> {
    try {
      const kudaApiKey = await this.kudaApiKeyRespository.getUserApiKey(userId)

      return {
        status: true,
        message: 'User Kuda API key fetched successfully',
        data: { kudaApiKey },
      }
    } catch (error) {
      throw error
    }
  }
  public async connectKuda(payload: TCreateKudaApiKey): Promise<TServiceResponse<null>> {
    try {
      const apiKey = await this.kudaApiKeyRespository.create(payload)
      await this.kudaService(apiKey).getToken()
      this.user.isKudaConnected = true
      await this.user.save()
      return {
        status: true,
        message: 'Token generated',
        data: null,
      }
    } catch (error) {
      if (error.code === 'ERR_BAD_RESPONSE' || error.code === 'ERR_BAD_REQUEST') {
        throw new BadRequestException('Invalid api key provided')
      }
      return HandleKudaError(error)
    }
  }

  public async getWallet(): Promise<TServiceResponse<any>> {
    try {
      await this.user.load('kudaKey')
      const reference = HelperUtil.generateAlphaNumeric(8)
      const wallet = await this.kudaService(this.user.kudaKey).getWalletBalance(reference)

      this.kudaLogRepository.create({
        isSuccess: true,
        userId: this.user.id,
        ref: reference,
        serviceType: KUDA_SERVICE_TYPE_ENUM.ADMIN_RETRIEVE_MAIN_ACCOUNT_BALANCE,
        response: wallet,
      })
      return {
        status: true,
        message: 'Main wallet retrieved',
        data: { withdrawableBalance: wallet.data.withdrawableBalance / 100 },
      }
    } catch (error) {
      return HandleKudaError(error)
    }
  }

  public async transactions(query?: {
    pageSize?: number
    pageNumber?: number
  }): Promise<TServiceResponse<any>> {
    try {
      await this.user.load('kudaKey')
      const reference = HelperUtil.generateAlphaNumeric(8)
      const res = await this.kudaService(this.user.kudaKey).transactions({
        ...query,
        reference,
      })

      const transactions = res.data.postingsHistory
      const mapTransactions = transactions.map((transaction) => ({
        transactionId: transaction.referenceNumber,
        type: HelperUtil.getTransactionType(transaction.entryCode),
        account: {
          name: transaction.beneficiaryName,
          number: transaction.beneficiaryReference,
          bank: transaction.merchant,
        },
        amount: transaction.amount / 100,
        createdAt: DateTime.fromISO(transaction.realDate).toFormat('yyyy-LL-dd hh:mm a'),
      }))
      this.kudaLogRepository.create({
        isSuccess: true,
        userId: this.user.id,
        ref: reference,
        serviceType: KUDA_SERVICE_TYPE_ENUM.ADMIN_RETRIEVE_MAIN_ACCOUNT_BALANCE,
        response: res,
      })

      return {
        status: true,
        message: 'Kuda Main transactions retrieved',
        data: mapTransactions,
      }
    } catch (error) {
      return HandleKudaError(error)
    }
  }

  public async queryAccountNumber(accountNumber: string): Promise<TServiceResponse<any>> {
    try {
      await this.user.load('kudaKey')
      const reference = HelperUtil.generateAlphaNumeric(8)
      const account = await this.kudaService(this.user.kudaKey).queryBankDetails({
        reference: reference,
        accountNumber,
        bankCode: '090267',
      })
      this.kudaLogRepository.create({
        isSuccess: true,
        userId: this.user.id,
        ref: reference,
        serviceType: KUDA_SERVICE_TYPE_ENUM.NAME_ENQUIRY,
        response: account,
      })
      return {
        status: true,
        message: 'Account retrieved',
        data: {
          name: account.data.beneficiaryName,
        },
      }
    } catch (error) {
      return HandleKudaError(error)
    }
  }

  private kudaService(kudaApiKey: KudaApiKey): KudaServiceProvider {
    return new KudaServiceProvider(kudaApiKey)
  }
}
