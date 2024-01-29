/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'

Route.get('/', async ({ response }) => {
  return response.status(200).json({
    status: true,
    message: `Welcome to Anonance API services running on ${Env.get('NODE_ENV')} environment`,
    data: null,
  })
})

Route.any('/api/v1', async ({ response }) => {
  return response.status(200).json({
    status: true,
    message: `Welcome to Anonance API services version one running on ${Env.get(
      'NODE_ENV'
    )} environment`,
    data: null,
  })
})

Route.get('/api/v1/health', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy ? response.ok(report) : response.badRequest(report)
})

import './routes/auth/index'
import './routes/user/index'
import './routes/admin/index'
