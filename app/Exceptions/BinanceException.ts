import { Exception } from '@adonisjs/core/build/standalone'
import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new BinanceException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class BinanceException extends Exception {
  public async handle(error: this, ctx: HttpContextContract) {
    if (Env.get('NODE_ENV') === 'development') {
      console.log(error)
    }
    ctx.response.status(500).json({
      status: false,
      message: error.message || 'Binance connection error',
      data: Env.get('NODE_ENV') === 'development' ? error.stack : null,
    })
  }
}
