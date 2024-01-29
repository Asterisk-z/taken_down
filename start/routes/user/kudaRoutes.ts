import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/connect-kuda', 'User/KudaController.connect').middleware(['auth', 'isUser'])
  Route.get('/get-user-kuda', 'User/KudaController.getUserAPIKey').middleware([
    'auth',
    'isUser',
    'isKudaConnected',
  ])
  Route.get('/get-main-wallet', 'User/KudaController.getMainWallet').middleware([
    'auth',
    'isUser',
    'isKudaConnected',
  ])
  Route.get('/query-kuda-acctNo', 'User/KudaController.queryAccounNumber').middleware([
    'auth',
    'isUser',
    'isKudaConnected',
  ])
  Route.get('/kuda-transactions', 'User/KudaController.transactions').middleware([
    'auth',
    'isUser',
    'isKudaConnected',
  ])
}).prefix('/api/v1')
