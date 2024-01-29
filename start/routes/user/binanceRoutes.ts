import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/get-binance-key', 'User/BinanceController.GetUserBinanceDetails').middleware([
    'auth',
    'isUser',
    'isBinanceConnected',
  ])
  Route.post('/connect-binance', 'User/BinanceController.connect').middleware(['auth', 'isUser'])
  Route.get('/get-binance-orders', 'User/BinanceController.showOrders').middleware([
    'auth',
    'isUser',
    'isBinanceConnected',
  ])
}).prefix('/api/v1')
