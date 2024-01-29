import { BaseCommand } from '@adonisjs/core/build/standalone'
import BullMQ from '@ioc:Adonis/Addons/BullMQ'
import { TQueuePayment } from 'App/Shared/Types/QueueType'
import { QUEUE_NAME_ENUM } from 'App/Shared/Enums/QueueEnum'
import { TUserBinancePendingOrders } from 'App/Shared/Types/Binance/BinanceApiResponseType'
import User from 'App/Models/User'
import { HelperUtil } from 'App/Utils/HelperUtil'
import KudaApiKey from 'App/Models/KudaApiKey'
import { KudaServiceProvider } from 'App/Services/ExternalProviders/KudaServiceProvider'
import TransactionRepositoryInterface from 'App/Repositories/Interfaces/TransactionRepositoryInterface'
import TransactionRepository from 'App/Repositories/Model/TransactionRepositoryModel'
import { TRANSACTION_STATUS } from 'App/Shared/Enums/TransactionEnums'
import BinanceApiKey from 'App/Models/BinanceApiKey'
import { BinanceServiceProvider } from 'App/Services/ExternalProviders/BinanceServiceProvider'
import { NodeMailerServiceProvider } from 'App/Services/ExternalProviders/Email/NodeMailerProvider'
import { SlackServiceProvider } from 'App/Services/ExternalProviders/SlackServiceProvider'

interface BankInfo {
  bankName: string
  bankCode: string
}

interface Account {
  bank: string
  number: string
  name: string
}

export default class QueueListener extends BaseCommand {
  public static commandName = 'queue:listener'

  public static description = 'Starts the BullMQ worker for processing jobs'

  public static settings = {
    loadApp: true,
    stayAlive: true, // Set to true to keep the command running
  }

  private kudaReference: string = `KUA${HelperUtil.generateAlphaNumeric()}`
  private transactionRepository: TransactionRepositoryInterface = new TransactionRepository()

  public async run() {
    // Define the BullMQ worker for a specific queue
    BullMQ.worker<TQueuePayment, TQueuePayment>(QUEUE_NAME_ENUM.PROCESS_PAYMENT, async (job) => {
      try {
        let successCount: number = 0

        for (const payload of job.data.payload) {
          const resp = await this.initializePayment(payload, job.data.user)
          if (resp.status) {
            successCount++
          }
          if (!resp.status) {
            await this.failedTransactionLog({
              orderNo: payload.orderNo,
              requestRef: '',
              accountName: payload.account.name,
              accountNumber: payload.account.number,
              bankCode: '00000',
              bankName: payload.account.bank,
              amount: payload.amount,
              userId: job.data.user.id,
              kudaRef: '',
              cancelationReason: resp.message,
            })
            // Send notification to user if the processing fails and amount is greater or equal 1,000,000
            if (payload.amount >= 1000000) {
              const message = `
              Dear ${job.data.user.fullName},
              We tried processing a sum of ${payload.amount} for order number: ${payload.orderNo} but it failed due to ${resp.message}
              Kindly attend to this
            `
              await NodeMailerServiceProvider.send({
                recipient: job.data.user.email,
                subject: 'URGENT ACTION REQUIRED!!!',
                message,
              })
            }
          }
        }

        if (successCount > 0) {
          const message = `
            <p>
              Dear ${job.data.user.fullName},
            </p>
            <p>
              We have processed ${successCount} of ${job.data.payload.length} order, please visit your dashboard for more info
            </p>
          `
          await SlackServiceProvider.sendMessageToChannel(message)
        }
        return job.data
      } catch (error) {
        console.error('Error processing job:', error)
        throw error
      }
    })
  }

  private async initializePayment(data: TUserBinancePendingOrders, user: User) {
    try {
      const transaction = await this.transactionRepository.getCompletedBinanceTransaction(
        data.orderNo
      )
      if (transaction) {
        await SlackServiceProvider.sendMessageToChannel(
          `Order number ${data.orderNo} has already been processed and completed`
        )
        return {
          status: false,
          message: `Order number ${data.orderNo} has already been processed and completed`,
          data: data,
        }
      }
      if (!data.account.bank || !data.account.name || !data.account.number || !data.amount) {
        await this.cancelOrder({ user, orderNo: data.orderNo, amount: data.amount })
        await SlackServiceProvider.sendMessageToChannel(
          `Order number ${data.orderNo} was canceled due to user account information not complete`
        )
        return {
          status: false,
          message: `Order number ${data.orderNo} was canceled due to user account information not complete`,
          data: data,
        }
      }
      const accountToPayTo: Account = {
        bank: data.account.bank,
        name: data.account.name,
        number: data.account.number,
      }
      const mappedBankAccount = await this.mapUserBank(user, accountToPayTo)
      if (!mappedBankAccount) {
        await this.cancelOrder({ user, orderNo: data.orderNo, amount: data.amount })
        await SlackServiceProvider.sendMessageToChannel(
          `We could not match the provided account details on order number ${
            data.orderNo
          } therefore, the order was canceled. Account: ${JSON.stringify(accountToPayTo)}`
        )
        return {
          status: false,
          message: `We could not match the provided account details on order number ${data.orderNo} therefore, the order was canceled`,
          data: data,
        }
      }
      const queryUserAccountDetail = await this.kudaService(user.kudaKey).queryBankDetails({
        reference: this.kudaReference,
        accountNumber: accountToPayTo.number.replace(/\s/g, ''),
        bankCode: mappedBankAccount.bankCode,
      })
      if (!queryUserAccountDetail.status) {
        await this.cancelOrder({ user, orderNo: data.orderNo, amount: data.amount })
        await SlackServiceProvider.sendMessageToChannel(
          `The account details provided on order number: ${data.orderNo} does not return a valid name from Kuda`
        )
        return {
          status: false,
          message: `The account details provided on order number: ${data.orderNo} does not return a valid name from Kuda`,
          data: data,
        }
      }
      const userKudaBeneficiaryName = queryUserAccountDetail.data.beneficiaryName.toLowerCase()
      const userBinanceBeneficiaryName = accountToPayTo.name.toLowerCase()
      const isNameValid = this.verifyUserBankAccountName(
        userBinanceBeneficiaryName,
        userKudaBeneficiaryName
      )
      if (!isNameValid) {
        await this.cancelOrder({ user, orderNo: data.orderNo, amount: data.amount })
        await SlackServiceProvider.sendMessageToChannel(
          `Unable to verify beneficiary name on order No: ${data.orderNo}. Name on Binance: ${userBinanceBeneficiaryName}, Name from Kuda: ${userKudaBeneficiaryName}`
        )
        return {
          status: false,
          message: `Unable to verify beneficiary name on order No: ${data.orderNo}. Name on Binance: ${userBinanceBeneficiaryName}, Name from Kuda: ${userKudaBeneficiaryName}`,
          data: data,
        }
      }
      const userBalance = await this.getWallet(user)
      if (!userBalance.status) {
        await this.cancelOrder({ user, orderNo: data.orderNo, amount: data.amount })
        await SlackServiceProvider.sendMessageToChannel(
          `Unable to retrieve Kuda wallet balance on order number: ${data.orderNo}`
        )
        return {
          status: false,
          message: `Unable to retrieve Kuda wallet balance on order number: ${data.orderNo}`,
          data: data,
        }
      }
      if (userBalance.data.withdrawableBalance < data.amount * 100) {
        await this.cancelOrder({ user, orderNo: data.orderNo, amount: data.amount })
        await SlackServiceProvider.sendMessageToChannel(
          `Insufficient balance to complete the transfer. Order number: ${data.orderNo}`
        )
        return {
          status: false,
          message: `Insufficient balance to complete the transfer. Order number: ${data.orderNo}`,
          data: data,
        }
      }
      const requestRef = HelperUtil.generateNumeric(8)
      const transfer = await this.kudaService(user.kudaKey).singleFundTransfer({
        requestRef: `KUA${requestRef}`,
        nameEnquirySessionID: queryUserAccountDetail.data.sessionID ?? 'NA',
        clientAccountNumber: user.kudaKey.accountNumber,
        beneficiaryBankCode: queryUserAccountDetail.data.beneficiaryBankCode,
        beneficiaryAccount: queryUserAccountDetail.data.beneficiaryAccountNumber,
        beneficiaryName: queryUserAccountDetail.data.beneficiaryName,
        narration: user.kudaKey.narration,
        amount: data.amount * 100,
        trackingReference: this.kudaReference,
        senderName: user.kudaKey.accountName,
      })
      if (transfer.status && transfer.message.includes('successful')) {
        await this.transactionRepository.createTransaction({
          ref: this.kudaReference,
          binanceOrderId: data.orderNo,
          requestRef,
          accountName: queryUserAccountDetail.data.beneficiaryName,
          accountNumber: queryUserAccountDetail.data.beneficiaryAccountNumber,
          bank: mappedBankAccount.bankName,
          bankCode: queryUserAccountDetail.data.beneficiaryBankCode,
          bankCharges: 0,
          amount: data.amount,
          status: TRANSACTION_STATUS.COMPLETED,
          userId: user.id,
          kudaTransactionReference: transfer.transactionReference,
        })
        await this.binanceService(user.binanceKey).markOrderAsPaid(data.orderNo, requestRef)
      } else {
        await this.transactionRepository.createTransaction({
          ref: this.kudaReference,
          binanceOrderId: data.orderNo,
          requestRef,
          accountName: queryUserAccountDetail.data.beneficiaryName,
          accountNumber: queryUserAccountDetail.data.beneficiaryAccountNumber,
          bank: mappedBankAccount.bankName,
          bankCode: queryUserAccountDetail.data.beneficiaryBankCode,
          bankCharges: 0,
          amount: data.amount,
          status: TRANSACTION_STATUS.CANCELED,
          userId: user.id,
          kudaTransactionReference: transfer.transactionReference,
        })
        await this.cancelOrder({ user, orderNo: data.orderNo, amount: data.amount })
        await SlackServiceProvider.sendMessageToChannel(
          `Unable to transfer ${
            data.amount
          } funds to users account. Kuda response: ${JSON.stringify(transfer)}`
        )
        return {
          status: false,
          message: `Unable to transfer fund to user`,
          data: data,
        }
      }

      return {
        status: true,
        message: 'Transaction completed and marked as paid',
        data,
      }
    } catch (error) {
      await SlackServiceProvider.sendMessageToChannel(
        error.message || 'We could not process this payment'
      )
      return {
        status: false,
        message: error.message || 'We could not process this payment',
        data: error,
      }
    }
  }

  private async mapUserBank(user: User, account: Account) {
    try {
      const bankLists = await this.kudaService(user.kudaKey).bankList(this.kudaReference)
      const banksData = bankLists.data.banks
      const bankNameMap = this.matchBank(banksData, account)
      return bankNameMap
    } catch (error) {
      throw error
    }
  }

  private async getWallet(user: User) {
    try {
      return await this.kudaService(user.kudaKey).getWalletBalance(this.kudaReference)
    } catch (error) {
      return {
        status: false,
        message: error.message || 'This is a server error, the user balance could not be retrieved',
        data: error,
      }
    }
  }

  // private async verifyTransactionStatus(ref: string, user: User) {
  //   try {
  //     return await this.kudaService(user.kudaKey).transactionStatus({
  //       reference: this.kudaReference,
  //       transactionReference: ref,
  //       isThirdPartyBankTransfer: true,
  //     })
  //   } catch (error) {
  //     throw error
  //   }
  // }

  private kudaService(kudaApiKey: KudaApiKey): KudaServiceProvider {
    return new KudaServiceProvider(kudaApiKey)
  }

  private binanceService(binanceApiKey: BinanceApiKey): BinanceServiceProvider {
    return new BinanceServiceProvider(binanceApiKey)
  }

  private matchBank(bankList: BankInfo[], account: Account): BankInfo | undefined {
    const bankNameMap: Record<string, string> = {}
    bankList.forEach((bankInfo) => {
      const canonicalBankName = bankInfo.bankName.toLowerCase().trim()
      bankNameMap[canonicalBankName] = bankInfo.bankName
      bankNameMap['paycom(opay)'] = 'Paycom(OPay)'
      bankNameMap['paycom(opay) '] = 'Paycom(OPay)'
      bankNameMap['opay(paycom)'] = 'Paycom(OPay)'
      bankNameMap['opay(paycom) '] = 'Paycom(OPay)'
      bankNameMap['opay (paycom)'] = 'Paycom(OPay)'
      bankNameMap['opay (paycom) '] = 'Paycom(OPay)'
      bankNameMap['opay'] = 'Paycom(OPay)'
      bankNameMap['opay '] = 'Paycom(OPay)'
      bankNameMap['paycom'] = 'Paycom(OPay)'
      bankNameMap['paycom '] = 'Paycom(OPay)'
      bankNameMap['paycom digital'] = 'Paycom(OPay)'
      bankNameMap['paycom digital '] = 'Paycom(OPay)'
      bankNameMap['opay digital limited'] = 'Paycom(OPay)'
      bankNameMap['opay digital limited '] = 'Paycom(OPay)'
      bankNameMap['paycom digital service'] = 'Paycom(OPay)'
      bankNameMap['paycom digital service '] = 'Paycom(OPay)'
      bankNameMap['paycom digital service limited'] = 'Paycom(OPay)'
      bankNameMap['paycom digital service limited '] = 'Paycom(OPay)'
      bankNameMap['paycom digital services'] = 'Paycom(OPay)'
      bankNameMap['paycom digital services '] = 'Paycom(OPay)'
      bankNameMap['paycom digital services limited'] = 'Paycom(OPay)'
      bankNameMap['paycom digital services limited '] = 'Paycom(OPay)'
      bankNameMap['0pay'] = 'Paycom(OPay)'
      bankNameMap['0pay '] = 'Paycom(OPay)'
      bankNameMap['opay bank'] = 'Paycom(OPay)'
      bankNameMap['opay bank '] = 'Paycom(OPay)'
      bankNameMap['0pay bank'] = 'Paycom(OPay)'
      bankNameMap['0pay bank '] = 'Paycom(OPay)'
      bankNameMap['opay digital'] = 'Paycom(OPay)'
      bankNameMap['opay digital '] = 'Paycom(OPay)'
      bankNameMap['0pay digital'] = 'Paycom(OPay)'
      bankNameMap['0pay digital '] = 'Paycom(OPay)'
      bankNameMap['opay digital service'] = 'Paycom(OPay)'
      bankNameMap['opay digital service '] = 'Paycom(OPay)'
      bankNameMap['0pay digital service'] = 'Paycom(OPay)'
      bankNameMap['0pay digital service '] = 'Paycom(OPay)'
      bankNameMap['opay digital services'] = 'Paycom(OPay)'
      bankNameMap['opay digital services '] = 'Paycom(OPay)'
      bankNameMap['opay digital services limited'] = 'Paycom(OPay)'
      bankNameMap['opay digital services limited '] = 'Paycom(OPay)'
      bankNameMap['opay digital services limited (opay)'] = 'Paycom(OPay)'
      bankNameMap['opay digital services limited (opay) '] = 'Paycom(OPay)'
      bankNameMap['opaybank'] = 'Paycom(OPay)'
      bankNameMap['opaybank '] = 'Paycom(OPay)'
      bankNameMap['opay bank limited'] = 'Paycom(OPay)'
      bankNameMap['opay bank limited '] = 'Paycom(OPay)'
      bankNameMap['united bank for africa'] = 'United Bank for Africa'
      bankNameMap['united bank for africa '] = 'United Bank for Africa'
      bankNameMap['uba'] = 'United Bank for Africa'
      bankNameMap['uba '] = 'United Bank for Africa'
      bankNameMap['ubabank'] = 'United Bank for Africa'
      bankNameMap['ubabank '] = 'United Bank for Africa'
      bankNameMap['uba bank'] = 'United Bank for Africa'
      bankNameMap['uba bank '] = 'United Bank for Africa'
      bankNameMap['united bank of africa'] = 'United Bank for Africa'
      bankNameMap['united bank of africa '] = 'United Bank for Africa'
      bankNameMap['united bank africa'] = 'United Bank for Africa'
      bankNameMap['united bank africa '] = 'United Bank for Africa'
      bankNameMap['gtbank Plc'] = 'GTBank Plc'
      bankNameMap['gtbank Plc '] = 'GTBank Plc'
      bankNameMap['gtb'] = 'GTBank Plc'
      bankNameMap['gtb '] = 'GTBank Plc'
      bankNameMap['gt'] = 'GTBank Plc'
      bankNameMap['gt '] = 'GTBank Plc'
      bankNameMap['gtbank'] = 'GTBank Plc'
      bankNameMap['gtbank '] = 'GTBank Plc'
      bankNameMap['gt bank'] = 'GTBank Plc'
      bankNameMap['gt bank '] = 'GTBank Plc'
      bankNameMap['gt bank plc'] = 'GTBank Plc'
      bankNameMap['gt bank plc '] = 'GTBank Plc'
      bankNameMap['gtabank'] = 'GTBank Plc'
      bankNameMap['gtabank '] = 'GTBank Plc'
      bankNameMap['guaranty trust bank'] = 'GTBank Plc'
      bankNameMap['guaranty trust bank '] = 'GTBank Plc'
      bankNameMap['guaranty trust bank (gtb)'] = 'GTBank Plc'
      bankNameMap['guaranty trust bank (gtb) '] = 'GTBank Plc'
      bankNameMap['guarantee trust bank (gtb)'] = 'GTBank Plc'
      bankNameMap['guarantee trust bank (gtb) '] = 'GTBank Plc'
      bankNameMap['guarantee trust bank'] = 'GTBank Plc'
      bankNameMap['guarantee trust bank '] = 'GTBank Plc'
      bankNameMap['guarantee trust bank (gtb)'] = 'GTBank Plc'
      bankNameMap['guarantee trust bank (gtb) '] = 'GTBank Plc'
      bankNameMap['guarantee trust bank'] = 'GTBank Plc'
      bankNameMap['guarantee trust bank '] = 'GTBank Plc'
      bankNameMap['guaranty bank'] = 'GTBank Plc'
      bankNameMap['guaranty bank '] = 'GTBank Plc'
      bankNameMap['guaranty trust bank plc'] = 'GTBank Plc'
      bankNameMap['guaranty trust bank plc '] = 'GTBank Plc'
      bankNameMap['kuda'] = 'Kuda.'
      bankNameMap['kuda '] = 'Kuda.'
      bankNameMap['kuda bank'] = 'Kuda.'
      bankNameMap['kuda bank '] = 'Kuda.'
      bankNameMap['kudabank'] = 'Kuda.'
      bankNameMap['kudabank '] = 'Kuda.'
      bankNameMap['kuda  bank (wakawallet technologiest limited)'] = 'Kuda.'
      bankNameMap['kuda  bank (wakawallet technologiest limited) '] = 'Kuda.'
      bankNameMap['kuda mfb'] = 'Kuda.'
      bankNameMap['kuda mfb '] = 'Kuda.'
      bankNameMap['kuda microfinance bank'] = 'Kuda.'
      bankNameMap['kuda microfinance bank '] = 'Kuda.'
      bankNameMap['kuda micro finance bank'] = 'Kuda.'
      bankNameMap['kuda micro finance bank '] = 'Kuda.'
      bankNameMap['first bank of nigeria'] = 'First Bank of Nigeria'
      bankNameMap['first bank of nigeria '] = 'First Bank of Nigeria'
      bankNameMap['first bank nigeria'] = 'First Bank of Nigeria'
      bankNameMap['first bank nigeria '] = 'First Bank of Nigeria'
      bankNameMap['first bank'] = 'First Bank of Nigeria'
      bankNameMap['first bank '] = 'First Bank of Nigeria'
      bankNameMap['first bank plc'] = 'First Bank of Nigeria'
      bankNameMap['first bank plc '] = 'First Bank of Nigeria'
      bankNameMap['firstbank plc'] = 'First Bank of Nigeria'
      bankNameMap['firstbank plc '] = 'First Bank of Nigeria'
      bankNameMap['firstbank'] = 'First Bank of Nigeria'
      bankNameMap['firstbank '] = 'First Bank of Nigeria'
      bankNameMap['flutterwave technology solutions limited'] = 'Flutterwave Technology solutions Limited'
      bankNameMap['flutterwave technology solutions limited '] = 'Flutterwave Technology solutions Limited'
      bankNameMap['flutterwave'] = 'Flutterwave Technology solutions Limited'
      bankNameMap['flutterwave '] = 'Flutterwave Technology solutions Limited'
      bankNameMap['flutterwave bank'] = 'Flutterwave Technology solutions Limited'
      bankNameMap['flutterwave bank '] = 'Flutterwave Technology solutions Limited'
      bankNameMap['globus bank'] = 'Globus Bank'
      bankNameMap['globus bank '] = 'Globus Bank'
      bankNameMap['globus'] = 'Globus Bank'
      bankNameMap['globus '] = 'Globus Bank'
      bankNameMap['glubus'] = 'Globus Bank'
      bankNameMap['glubus '] = 'Globus Bank'
      bankNameMap['keystone bank'] = 'Keystone Bank'
      bankNameMap['keystone bank '] = 'Keystone Bank'
      bankNameMap['keystone'] = 'Keystone Bank'
      bankNameMap['keystone '] = 'Keystone Bank'
      bankNameMap['paga'] = 'Paga'
      bankNameMap['paga '] = 'Paga'
      bankNameMap['paga bank'] = 'Paga'
      bankNameMap['paga bank '] = 'Paga'
      bankNameMap['paga mfb'] = 'Paga'
      bankNameMap['paga mfb '] = 'Paga'
      bankNameMap['pagabank'] = 'Paga'
      bankNameMap['pagabank '] = 'Paga'
      bankNameMap['palmpay'] = 'PALMPAY'
      bankNameMap['palmpay '] = 'PALMPAY'
      bankNameMap['palm pay'] = 'PALMPAY'
      bankNameMap['palm pay '] = 'PALMPAY'
      bankNameMap['palm pay mfb'] = 'PALMPAY'
      bankNameMap['palm pay mfb '] = 'PALMPAY'
      bankNameMap['pampay'] = 'PALMPAY'
      bankNameMap['pampay '] = 'PALMPAY'
      bankNameMap['palmpaymfb'] = 'PALMPAY'
      bankNameMap['palmpaymfb '] = 'PALMPAY'
      bankNameMap['palmpay mfb'] = 'PALMPAY'
      bankNameMap['palmpay mfb '] = 'PALMPAY'
      bankNameMap['palmpay mfbank'] = 'PALMPAY'
      bankNameMap['palmpay mfbank '] = 'PALMPAY'
      bankNameMap['polaris'] = 'POLARIS BANK'
      bankNameMap['polaris '] = 'POLARIS BANK'
      bankNameMap['polaris bank'] = 'POLARIS BANK'
      bankNameMap['polaris bank '] = 'POLARIS BANK'
      bankNameMap['polarisbank'] = 'POLARIS BANK'
      bankNameMap['polarisbank '] = 'POLARIS BANK'
      bankNameMap['providus'] = 'Providus Bank'
      bankNameMap['providus '] = 'Providus Bank'
      bankNameMap['providus mfb'] = 'Providus Bank'
      bankNameMap['providus mfb '] = 'Providus Bank'
      bankNameMap['providusbank'] = 'Providus Bank'
      bankNameMap['providusbank '] = 'Providus Bank'
      bankNameMap['providus bank'] = 'Providus Bank'
      bankNameMap['providus bank '] = 'Providus Bank'
      bankNameMap['stanbicibtc bank'] = 'StanbicIBTC Bank'
      bankNameMap['stanbicibtc bank '] = 'StanbicIBTC Bank'
      bankNameMap['stanbic ibtc bank'] = 'StanbicIBTC Bank'
      bankNameMap['stanbic ibtc bank '] = 'StanbicIBTC Bank'
      bankNameMap['stanbic'] = 'StanbicIBTC Bank'
      bankNameMap['stanbic '] = 'StanbicIBTC Bank'
      bankNameMap['stanbicbank'] = 'StanbicIBTC Bank'
      bankNameMap['stanbicbank '] = 'StanbicIBTC Bank'
      bankNameMap['stanbic bank'] = 'StanbicIBTC Bank'
      bankNameMap['stanbic bank '] = 'StanbicIBTC Bank'
      bankNameMap['stanbic ibtc'] = 'StanbicIBTC Bank'
      bankNameMap['stanbic ibtc '] = 'StanbicIBTC Bank'
      bankNameMap['standard chartered'] = 'StandardChartered'
      bankNameMap['standard chartered '] = 'StandardChartered'
      bankNameMap['standard'] = 'StandardChartered'
      bankNameMap['standard '] = 'StandardChartered'
      bankNameMap['standard chartered bank'] = 'StandardChartered'
      bankNameMap['standard chartered bank '] = 'StandardChartered'
      bankNameMap['vfb'] = 'VFD MFB'
      bankNameMap['vfb '] = 'VFD MFB'
      bankNameMap['vfd bank'] = 'VFD MFB'
      bankNameMap['vfd bank '] = 'VFD MFB'
      bankNameMap['vfd mfb'] = 'VFD MFB'
      bankNameMap['vfd mfb '] = 'VFD MFB'
      bankNameMap['union'] = 'Union Bank'
      bankNameMap['union '] = 'Union Bank'
      bankNameMap['unionbank'] = 'Union Bank'
      bankNameMap['unionbank '] = 'Union Bank'
      bankNameMap['union bank'] = 'Union Bank'
      bankNameMap['union bank '] = 'Union Bank'
      bankNameMap['zenith'] = 'ZENITH BANK PLC'
      bankNameMap['zenith '] = 'ZENITH BANK PLC'
      bankNameMap['zenith bank'] = 'ZENITH BANK PLC'
      bankNameMap['zenith bank '] = 'ZENITH BANK PLC'
      bankNameMap['zenith bank plc'] = 'ZENITH BANK PLC'
      bankNameMap['zenith bank plc '] = 'ZENITH BANK PLC'
      bankNameMap['zenith plc'] = 'ZENITH BANK PLC'
      bankNameMap['zenith plc '] = 'ZENITH BANK PLC'
      bankNameMap['wema bank'] = 'Wema Bank'
      bankNameMap['wema bank '] = 'Wema Bank'
      bankNameMap['wema'] = 'Wema Bank'
      bankNameMap['wema '] = 'Wema Bank'
      bankNameMap['wemabank'] = 'Wema Bank'
      bankNameMap['wemabank '] = 'Wema Bank'
      bankNameMap['wema bank plc'] = 'Wema Bank'
      bankNameMap['wema bank plc '] = 'Wema Bank'
      bankNameMap['wema bankplc'] = 'Wema Bank'
      bankNameMap['wema bankplc '] = 'Wema Bank'
      bankNameMap['first city monitery bank'] = 'FCMB'
      bankNameMap['first city monitery bank '] = 'FCMB'
      bankNameMap['First city monument bank'] = 'FCMB'
      bankNameMap['First city monument bank '] = 'FCMB'
      bankNameMap['First city bank'] = 'FCMB'
      bankNameMap['First city bank '] = 'FCMB'
      bankNameMap['fcmb bank'] = 'FCMB'
      bankNameMap['fcmb bank '] = 'FCMB'
      bankNameMap['fcmb'] = 'FCMB'
      bankNameMap['fcmb '] = 'FCMB'
      bankNameMap['carbon'] = 'Carbon'
      bankNameMap['carbon '] = 'Carbon'
      bankNameMap['carbon bank'] = 'Carbon'
      bankNameMap['carbon bank '] = 'Carbon'
      bankNameMap['carbon mfb'] = 'Carbon'
      bankNameMap['carbon mfb '] = 'Carbon'
      bankNameMap['carbon finance bank'] = 'Carbon'
      bankNameMap['carbon finance bank '] = 'Carbon'
      bankNameMap['sterling bank plc'] = 'Sterling Bank'
      bankNameMap['sterling bank plc '] = 'Sterling Bank'
      bankNameMap['sterling bank'] = 'Sterling Bank'
      bankNameMap['sterling bank '] = 'Sterling Bank'
      bankNameMap['sterling'] = 'Sterling Bank'
      bankNameMap['sterling '] = 'Sterling Bank'
      bankNameMap['eco'] = 'Ecobank Bank'
      bankNameMap['eco '] = 'Ecobank Bank'
      bankNameMap['ecobank'] = 'Ecobank Bank'
      bankNameMap['ecobank '] = 'Ecobank Bank'
      bankNameMap['ecobank bank'] = 'Ecobank Bank'
      bankNameMap['ecobank bank '] = 'Ecobank Bank'
      bankNameMap['ecobank plc'] = 'Ecobank Bank'
      bankNameMap['ecobank plc '] = 'Ecobank Bank'
      bankNameMap['access'] = 'Access Bank'
      bankNameMap['access '] = 'Access Bank'
      bankNameMap['access bank'] = 'Access Bank'
      bankNameMap['access bank '] = 'Access Bank'
      bankNameMap['access bank plc'] = 'Access Bank'
      bankNameMap['access bank plc '] = 'Access Bank'
      bankNameMap['access bank pc'] = 'Access Bank'
      bankNameMap['access bank pc '] = 'Access Bank'
      bankNameMap['accessbank'] = 'Access Bank'
      bankNameMap['accessbank '] = 'Access Bank'
      bankNameMap['accessbankdiamond'] = 'Access Bank PLC (Diamond)'
      bankNameMap['diamond access bank'] = 'Access Bank PLC (Diamond)'
      bankNameMap['diamond access bank '] = 'Access Bank PLC (Diamond)'
      bankNameMap['accessbankdiamond '] = 'Access Bank PLC (Diamond)'
      bankNameMap['access bank diamond'] = 'Access Bank PLC (Diamond)'
      bankNameMap['access bank diamond '] = 'Access Bank PLC (Diamond)'
      bankNameMap['access diamond'] = 'Access Bank PLC (Diamond)'
      bankNameMap['access diamond '] = 'Access Bank PLC (Diamond)'
      bankNameMap['access diamond bank'] = 'Access Bank PLC (Diamond)'
      bankNameMap['access diamond bank '] = 'Access Bank PLC (Diamond)'
      bankNameMap['access (diamond) bank '] = 'Access Bank PLC (Diamond)'
      bankNameMap['access (diamond) bank'] = 'Access Bank PLC (Diamond)'
      bankNameMap['access / diamond'] = 'Access Bank PLC (Diamond)'
      bankNameMap['access / diamond '] = 'Access Bank PLC (Diamond)'
      bankNameMap['diamond bank'] = 'Access Bank PLC (Diamond)'
      bankNameMap['diamond bank '] = 'Access Bank PLC (Diamond)'
      bankNameMap['fidelity'] = 'Fidelity Bank'
      bankNameMap['fidelity '] = 'Fidelity Bank'
      bankNameMap['fidelitybank'] = 'Fidelity Bank'
      bankNameMap['fidelitybank '] = 'Fidelity Bank'
      bankNameMap['fidelity bank'] = 'Fidelity Bank'
      bankNameMap['fidelity bank '] = 'Fidelity Bank'
      bankNameMap['moniepoint mfb'] = 'Moniepoint MFB'
      bankNameMap['moniepoint mfb '] = 'Moniepoint MFB'
      bankNameMap['moniepoint'] = 'Moniepoint MFB'
      bankNameMap['moniepoint '] = 'Moniepoint MFB'
      bankNameMap['monie point mfb'] = 'Moniepoint MFB'
      bankNameMap['monie point mfb '] = 'Moniepoint MFB'
      bankNameMap['moniepoint '] = 'Moniepoint MFB'
      bankNameMap['monie point '] = 'Moniepoint MFB'
      bankNameMap['moniepoint bank'] = 'Moniepoint MFB'
      bankNameMap['moniepoint bank '] = 'Moniepoint MFB'
      bankNameMap['monie point'] = 'Moniepoint MFB'
      bankNameMap['monie point '] = 'Moniepoint MFB'
      bankNameMap['monie point bank'] = 'Moniepoint MFB'
      bankNameMap['monie point bank '] = 'Moniepoint MFB'
      bankNameMap['9 payment service bank (9psb)'] = '9 Payment Service Bank (9PSB)'
      bankNameMap['9 payment service bank (9psb) '] = '9 Payment Service Bank (9PSB)'
      bankNameMap['9 payment service bank'] = '9 Payment Service Bank (9PSB)'
      bankNameMap['9 payment service bank '] = '9 Payment Service Bank (9PSB)'
      bankNameMap['9psb'] = '9 Payment Service Bank (9PSB)'
      bankNameMap['9psb '] = '9 Payment Service Bank (9PSB)'
      bankNameMap['9 payment'] = '9 Payment Service Bank (9PSB)'
      bankNameMap['9 payment '] = '9 Payment Service Bank (9PSB)'
    })

    const { bank: accountBank } = account
    const canonicalAccountBank = accountBank.toLowerCase()

    const canonicalBankName = bankNameMap[canonicalAccountBank]

    if (canonicalBankName) {
      const matchedBank = bankList.find(
        (bankInfo) => bankInfo.bankName.toLowerCase() === canonicalBankName.toLowerCase()
      )

      return matchedBank
    }

    return undefined
  }

  private verifyUserBankAccountName(existingWord: string, userInput: string): boolean {
    const existingWords = existingWord.toLowerCase().split(' ')
    const userWords = userInput.toLowerCase().split(' ')

    let count = 0
    const foundWords = new Set<string>()

    for (const word of userWords) {
      if (existingWords.includes(word) && !foundWords.has(word)) {
        foundWords.add(word)
        count++
      }
    }

    return count >= 1
  }

  private async failedTransactionLog({
    orderNo,
    requestRef,
    accountName,
    accountNumber,
    bankCode,
    bankName,
    amount,
    userId,
    kudaRef,
    cancelationReason,
  }: {
    orderNo: string
    requestRef: string
    accountName?: string
    accountNumber?: string
    bankName?: string
    bankCode?: string
    amount: number
    userId: string
    kudaRef?: string
    cancelationReason?: string
  }) {
    await this.transactionRepository.createTransaction({
      ref: this.kudaReference,
      binanceOrderId: orderNo,
      requestRef,
      accountName: accountName ?? '',
      accountNumber: accountNumber ?? '',
      bank: bankName ?? '',
      bankCode: bankCode ?? '',
      bankCharges: 0,
      amount: amount,
      status: TRANSACTION_STATUS.CANCELED,
      userId,
      kudaTransactionReference: kudaRef ?? '',
      cancelationReason,
    })
  }

  private async cancelOrder({
    user,
    orderNo,
    amount,
  }: {
    user: User
    orderNo: string
    amount: number
  }) {
    try {
      if (amount < 1000000) {
        await this.binanceService(user.binanceKey).cancelOrder({ orderNumber: orderNo })
      }
    } catch (error) {
      return {
        status: false,
        message: error.message || 'We could not cancel the order',
        data: error,
      }
    }
  }
}
