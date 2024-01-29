import { WebsocketAPI, Spot } from '@binance/connector-typescript'
import BinanceException from 'App/Exceptions/BinanceException'
import BinanceApiKey from 'App/Models/BinanceApiKey'
import { DateTime } from 'luxon'
import crypto from 'crypto'
import { AxiosHTTPClient } from 'App/Shared/HTTP/AxiosHTTP'
import Env from '@ioc:Adonis/Core/Env'
import { TListOrdersType, TOrderDetailType } from 'App/Shared/Types/Binance/BinanceApiResponseType'

type TOpenOrderResponse = {
  code: string
  message: string
  data: Array<TListOrdersType>
  total: number
  success: boolean
}

type TOrderDetailsResponse = {
  code: string
  message: string
  data: TOrderDetailType
  success: boolean
}
export class BinanceServiceProvider {
  constructor(binancekey: BinanceApiKey) {
    this.binanceApiKey = binancekey
  }
  private binanceApiKey: BinanceApiKey
  private websocketAPIClient: WebsocketAPI | null = null
  private baseUrl: string = Env.get('BINANCE_BASE_URL')

  public async connect() {
    try {
      const spot = new Spot(this.binanceApiKey.apiKey, this.binanceApiKey.apiSecret, {
        baseURL: this.baseUrl,
      })
      const client = await spot.accountStatus()
      return client
    } catch (error) {
      throw new BinanceException(error || 'Unable to connect to binance, invalid keys provided')
    }
  }

  public async openOrders() {
    try {
      const queryString = `timestamp=${DateTime.now().toMillis()}`
      const signature = this.generateSignature(queryString)
      const endpoint = 'https://api.binance.com/sapi/v1/c2c/orderMatch/listOrders'
      const url = `${endpoint}?${queryString}&signature=${signature}`

      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        url,
        data: {
          tradeType: 'BUY',
          page: 1,
          rows: 10, // Change to 10
          orderStatus: '1',
        },
        headers: {
          'X-MBX-APIKEY': this.binanceApiKey.apiKey,
          'Content-Type': 'application/json',
        },
      })
      return response as TOpenOrderResponse
    } catch (error) {
      throw error
    }
  }

  public async orderDetails(orderNo: string) {
    try {
      const queryString = `timestamp=${DateTime.now().toMillis()}`
      const signature = this.generateSignature(queryString)
      const endpoint = 'https://api.binance.com/sapi/v1/c2c/orderMatch/getUserOrderDetail'
      const url = `${endpoint}?${queryString}&signature=${signature}`

      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        url,
        data: {
          adOrderNo: orderNo,
        },
        headers: {
          'X-MBX-APIKEY': this.binanceApiKey.apiKey,
          'Content-Type': 'application/json',
        },
      })
      return response as TOrderDetailsResponse
    } catch (error) {
      throw error
    }
  }

  public async checkCanCancelOrder(orderNo: string) {
    try {
      const queryString = `timestamp=${DateTime.now().toMillis()}`
      const signature = this.generateSignature(queryString)
      const endpoint =
        'https://api.binance.com/sapi/v1/c2c/orderMatch/checkIfAllowedCancelOrderRetrieve'

      const url = `${endpoint}?${queryString}&signature=${signature}`

      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        url,
        data: {
          orderNumber: orderNo,
        },
        headers: {
          'X-MBX-APIKEY': this.binanceApiKey.apiKey,
          'Content-Type': 'application/json',
        },
      })
      return response as TOrderDetailsResponse
    } catch (error) {
      throw error
    }
  }

  public async cancelOrder({
    orderNumber,
    orderCancelAdditionalInfo,
  }: {
    orderNumber: string
    orderCancelAdditionalInfo?: string
  }) {
    try {
      const queryString = `timestamp=${DateTime.now().toMillis()}`
      const signature = this.generateSignature(queryString)
      const endpoint = 'https://api.binance.com/sapi/v1/c2c/orderMatch/cancelOrder'

      const url = `${endpoint}?${queryString}&signature=${signature}`

      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        url,
        data: {
          orderCancelAdditionalInfo,
          orderCancelReasonCode: 4,
          orderNumber,
        },
        headers: {
          'X-MBX-APIKEY': this.binanceApiKey.apiKey,
          'Content-Type': 'application/json',
        },
      })
      return response as TOrderDetailsResponse
    } catch (error) {
      throw error
    }
  }

  public async markOrderAsPaid(orderNo: string, payId: string) {
    try {
      const queryString = `timestamp=${DateTime.now().toMillis()}`
      const signature = this.generateSignature(queryString)
      const endpoint = 'https://api.binance.com/sapi/v1/c2c/orderMatch/markOrderAsPaid'

      const url = `${endpoint}?${queryString}&signature=${signature}`

      const response = await AxiosHTTPClient.execute({
        method: 'POST',
        url,
        data: {
          orderNumber: orderNo,
          payId,
        },
        headers: {
          'X-MBX-APIKEY': this.binanceApiKey.apiKey,
          'Content-Type': 'application/json',
        },
      })
      return response as TOrderDetailsResponse
    } catch (error) {
      throw error
    }
  }

  public async closeWebSocket() {
    try {
      if (this.websocketAPIClient) {
        this.websocketAPIClient.disconnect()
        this.websocketAPIClient
      }
    } catch (error) {
      console.error('Error closing WebSocket connection:', error.message)
      throw error
    }
  }

  private generateSignature(queryString: string): string {
    const hmac = crypto.createHmac('sha256', this.binanceApiKey.apiSecret)
    hmac.update(queryString)
    return hmac.digest('hex')
  }
}
