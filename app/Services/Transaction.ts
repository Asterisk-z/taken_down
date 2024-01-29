import TransactionRepository from "../Repositories/Model/TransactionRepositoryModel";
import TransactionRepositoryInterface from "App/Repositories/Interfaces/TransactionRepositoryInterface";
import { TServiceResponse } from "App/Shared/Types/ServiceResponseType";
import {
  TRANSACTION_STATUS,
  TransactionStatusType,
} from "App/Shared/Enums/TransactionEnums";
import User from "App/Models/User";
import NotFoundException from "App/Exceptions/NotFoundException";
import { TCreateTransaction } from "App/Shared/Types/TransactionType";
import { USERTYPE } from "App/Shared/Enums/UserEnum";
import { ModelPaginatorContract } from "@ioc:Adonis/Lucid/Orm";
import Transaction from "App/Models/Transaction";

export class TransactionService {
  public static transactionRepo: TransactionRepositoryInterface =
    new TransactionRepository();

  public static async SearchTransaction(
    payload: {
      name?: string;
      bank?: string;
      id?: string;
      accountNumber?: string;
    },
  ): Promise<TServiceResponse<unknown>> {
    try {
      const transactions = await this.transactionRepo.SearchTransaction(
        payload,
      );

      return {
        status: true,
        message: "Transaction search result",
        data: transactions,
      };
    } catch (error) {
      throw error;
    }
  }
  public static async CreateTransaction(
    payload: TCreateTransaction,
  ): Promise<TServiceResponse<unknown>> {
    try {
      const transaction = await this.transactionRepo.createTransaction(payload);

      return {
        status: true,
        message: "Transaction created",
        data: { transaction },
      };
    } catch (error) {
      throw error;
    }
  }
  public static async GetAllTransactions(
    status?: string,
    page?: string,
  ): Promise<TServiceResponse<unknown>> {
    try {
      const transactions: ModelPaginatorContract<Transaction> = await this
        .transactionRepo.getAllTransaction({
          status,
          page,
        }) as ModelPaginatorContract<Transaction>;

      const ids = transactions.map((t) => t.userId);
      const usersDetails = await User.query().whereIn("id", ids).select([
        "id",
        "anonanceId",
      ]);
      const usersMap = new Map(usersDetails.map((user) => [user.id, user]));

      let returntransactions = transactions.toJSON().data.map((transaction) => {
        const {
          accountName,
          accountNumber,
          bankAccountNumber,
          bank,
          createdAt,
          bankCode,
          ...t
        } = transaction.$attributes;
        return {
          anonanceId: usersMap.get(transaction.userId)?.anonanceId,
          bankDetails: {
            accountNumber,
            accountName,
            bankAccountNumber,
            bank,
            bankCode,
          },
          ...t,
          createdAt: `${transaction.createdAt}`.split("T")[0],
        };
      });

      return {
        status: true,
        message: "Transaction list fetched successfully",
        data: {
          meta: transactions.toJSON().meta,
          transactions: returntransactions,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  public static async GetATransaction(
    id: string,
  ): Promise<TServiceResponse<unknown>> {
    try {
      const transaction = await this.transactionRepo.getATransaction(id);

      const user = await User.query().where("id", transaction.userId).select([
        "anonanceId",
      ]).first();
      return {
        status: true,
        message: "Transaction detail fetched successfully",
        data: {
          transaction: {
            ...transaction.$attributes,
            anonanceId: user?.anonanceId,
            createdAt: `${transaction.createdAt}`.split("T")[0],
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  public static async GetAllUserTransaction(
    userId: string,
    page?: string,
    status?: string,
  ): Promise<TServiceResponse<unknown>> {
    try {
      const userTransactions = await this.transactionRepo.getAllTransaction({
        userId,
        page,
        status,
      }) as ModelPaginatorContract<Transaction>;
      const user = await User.query().where("id", userId).select(["anonanceId"])
        .first();

      const transactions = userTransactions.toJSON().data.map((transaction) => {
        const { createdAt, accountName, accountNumber, bankCode, bank, ...t } =
          transaction.$attributes;
        return {
          bankDetails: { accountNumber, accountName, bank, bankCode },
          createdAt: `${createdAt}`.split("T")[0],
          anonanceId: user?.anonanceId,
          ...t,
        };
      });

      return {
        status: true,
        message: "User transaction fetched successfully",
        data: {
          meta: userTransactions.toJSON().meta,
          transactions: transactions,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  public static async UpdateTransactionStatus(
    id: string,
    status: TransactionStatusType,
  ): Promise<TServiceResponse<null>> {
    try {
      await this.transactionRepo.updateATransaction(id, { status });
      return {
        status: true,
        message: "Transaction status has been updated",
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }

  public static async GetTransactionAnalytics(
    userId?: string,
  ): Promise<TServiceResponse<unknown>> {
    try {
      const transactions = await this.transactionRepo.getAllTransaction({
        userId,
        paginate: false,
      }) as Transaction[];

      const userNumbers = await User.query().where("type", USERTYPE.USER);
      const analytics: {
        totalOrders: number;
        totalAmountTransferred: number;
        totalSuccessfulTransactions: number;
        totalCanceledTransaction: number;
        totalNumberOfUsers: number;
      } = {
        totalOrders: transactions.length,
        totalAmountTransferred: 0,
        totalSuccessfulTransactions: 0,
        totalCanceledTransaction: 0,
        totalNumberOfUsers: userNumbers.length,
      };

      transactions.forEach((tx) => {
        if (tx.$attributes.status == TRANSACTION_STATUS.CANCELED) {
          analytics.totalCanceledTransaction =
            analytics.totalCanceledTransaction + 1;
        }
        if (tx.$attributes.status == TRANSACTION_STATUS.COMPLETED) {
          analytics.totalSuccessfulTransactions =
            analytics.totalSuccessfulTransactions + 1;
          analytics.totalAmountTransferred = analytics.totalAmountTransferred +
            tx.$attributes.amount;
        }
      });

      return {
        status: true,
        message: "Transaction analytics fetched successfully",
        data: { analytics },
      };
    } catch (error) {
      throw error;
    }
  }

  public static async GetUserTransactionOverview(
    userId: string,
    page?: string,
  ): Promise<TServiceResponse<unknown>> {
    try {
      const user = await User.query().where("id", userId).select([
        "id",
        "anonanceId",
        "firstName",
        "lastName",
        "binanceUsername",
        "phoneNumber",
        "email",
      ]).first();

      if (!user) throw new NotFoundException("User not found");

      let transactions = await this.transactionRepo.getAllTransaction({
        userId: user.id,
        paginate: false,
      }) as Transaction[];
      let transactionsMeta = await this.transactionRepo.getAllTransaction({
        userId,
        page,
      }) as ModelPaginatorContract<Transaction>;

      const overview = {
        totalTransactions: transactions.length,
        amount: 0,
        phoneNumber: user.phoneNumber || "",
        binanceUserId: user.binanceUsername || "",
      };

      const returnTransactions = transactions.map((tx) => {
        overview.amount = overview.amount + tx.amount;
        let account = {
          bankName: tx.bank,
          accountNumber: tx.accountNumber,
          accountName: tx.accountName,
        };
        return {
          account,
          createdAt: `${tx.createdAt}`.split("T")[0],
          ...tx.$attributes,
        };
      });
      //  console.log(overview)

      return {
        status: true,
        message: "User transactions have been fetched successfully",
        data: {
          user,
          overview,
          meta: transactionsMeta.toJSON().meta,
          transactions: returnTransactions,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
