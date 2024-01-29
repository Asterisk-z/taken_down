import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('user', 'Admin/UsersController').apiOnly()
  Route.patch("/user/toggle_user/:id", "Admin/UsersController.ToggleUser" )
})
  .middleware(['auth', 'isAdmin'])
  .prefix('/api/v1/admin')
