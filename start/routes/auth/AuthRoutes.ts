import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/login', 'AuthController.login')
  Route.get('/logout', 'AuthController.logout')
  Route.get('/user', 'AuthController.show').middleware(['auth'])
}).prefix('/api/v1/auth')
