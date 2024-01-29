import { ResponseContract } from '@ioc:Adonis/Core/Response'

export const HttpResponse = ({
  response,
  code,
  message,
  data,
}: {
  response: ResponseContract
  code: number
  message: string
  data?: any
}) => {
  return response.status(code).json({
    status: true,
    message: message,
    data: data ? data : null,
  })
}
