import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new NotFoundException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class NotFoundException extends Exception {
  public async handle(error: this, ctx: HttpContextContract) {
    if (Env.get('NODE_ENV') === 'development') {
      console.log(error)
    }
    ctx.response.status(404).json({
      status: false,
      message: error.message || 'Record does not exisit!!!',
      data: Env.get('NODE_ENV') === 'development' ? error.stack : null,
    })
  }
}
