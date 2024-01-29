import axios, { AxiosResponse } from 'axios'
import { HttpType } from 'App/Shared/Enums/HTTPMethodEnum'

export class AxiosHTTPClient {
  public static async execute({
    method,
    url,
    headers,
    data,
  }: {
    method: HttpType
    url: string
    headers: object
    data?: any
  }) {
    try {
      const { data: response }: AxiosResponse = await axios({
        url,
        method: method,
        data: data && JSON.stringify(data),
        headers,
      })
      return response
    } catch (error) {
      console.log(error.response.data)
      throw error
    }
  }
}
