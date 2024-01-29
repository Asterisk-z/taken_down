import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/", "Admin/TransactionController.HTTPCreateTransaction");
  Route.get("/all", "Admin/TransactionController.HTTPGetAllTransaction");
  Route.get("/one/:id", "Admin/TransactionController.HTTPGetATransaction");
  Route.get(
    "/analytics",
    "Admin/TransactionController.HTTPGetTransactionAnalytics",
  );
  Route.get(
    "/user/overview",
    "Admin/TransactionController.HTTPGetUserTransactionOverview",
  );
  Route.get("/search", "Admin/TransactionController.HTTPSearchTransaction");
}).middleware(["auth", "isAdmin"])
  .prefix("/api/v1/admin/transaction");

// Route.get("api/v1/user", "Admin/TransactionController.HTTPGetUserTransactin ").middleware(["auth", "isUser"])
