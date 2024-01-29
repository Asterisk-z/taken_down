import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.patch('/create-profile', 'User/UsersController.createProfile').middleware([
    'auth',
    'isUser',
  ])
  Route.post('/verify-phone', 'User/UsersController.verifyPhoneNumber').middleware([
    'auth',
    'isUser',
  ])
  Route.get("/forgot-password", "User/UsersController.UserForgotPassword")
  Route.patch("/reset-password", "User/UsersController.UserResetPassword")
}).prefix('/api/v1')
