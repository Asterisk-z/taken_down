
import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
Route.get("/transaction", "User/TransactionController.HTTPGetMyTransaction")
  Route.get("/transaction/stats", "User/TransactionController.HTTPGetMyTransactionStats")
Route.get("/transaction/:id", "Admin/TransactionController.HTTPGetATransaction")

}).middleware(["auth", "isUser"]).prefix("/api/v1/user")
