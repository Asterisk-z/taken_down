import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class RepositoryProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
    this.app.container.bind('App/Repositories/UserRepository', () => {
      const UserRepositoryModel = require('App/Repositories/Model/UserRepositoryModel')
      return UserRepositoryModel
    })

    this.app.container.bind('App/Repositories/KudaApiKeyRepository', () => {
      const KudaApiKeyRepositoryModel = require('App/Repositories/Model/KudaApiKeyRepositoryModel')
      return KudaApiKeyRepositoryModel
    })

    this.app.container.bind('App/Repositories/KudaLogRepository', () => {
      const KudaLogRepositoryModel = require('App/Repositories/Model/KudaLogRepositoryModel')
      return KudaLogRepositoryModel
    })

    this.app.container.bind('App/Repositories/BinanceApiKeyRepository', () => {
      const BinanceApiKeyRepositoryModel = require('App/Repositories/Model/BinanceApiKeyRepositoryModel')
      return BinanceApiKeyRepositoryModel
    })

    this.app.container.bind('App/Repositories/BinanceLogRepository', () => {
      const BinanceLogRepositoryModel = require('App/Repositories/Model/BinanceLogRepositoryModel')
      return BinanceLogRepositoryModel
    })

    this.app.container.bind('App/Repositories/TransactionRepository', () => {
      const TransactionRepositoryModel = require('App/Repositories/Model/TransactionRepositoryModel')
      return TransactionRepositoryModel
    })
  }

  public async boot() {
    // All bindings are ready, feel free to use them
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
