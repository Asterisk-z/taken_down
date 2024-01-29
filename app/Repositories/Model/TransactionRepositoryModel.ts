import { ModelPaginatorContract } from "@ioc:Adonis/Lucid/Orm";
import NotFoundException from "App/Exceptions/NotFoundException";
import Transaction from "App/Models/Transaction";
import { TCreateTransaction } from "App/Shared/Types/TransactionType";
import ITransactionRepository from "../Interfaces/TransactionRepositoryInterface";
import { TRANSACTION_STATUS } from "App/Shared/Enums/TransactionEnums";

export default class TransactionRepository implements ITransactionRepository {
  public async SearchTransaction(
    { id, bank, accountNumber, name }: {
      id: string;
      bank: string;
      accountNumber: string;
      name: string;
    },
  ): Promise<Transaction[]> {
    try {
      const query = Transaction.query();
      if (id) {
        query.where("id", id);
      }
      if (bank) {
        query.where("bank", bank);
      }
      if (name) {
        query.where("accountName", name);
      }

      if (accountNumber) {
        query.where("accountNumber", accountNumber);
      }

      const transaction = await query;
      return transaction;
    } catch (error) {
      throw error;
    }
  }
  public async getAllTransaction({
    page,
    status,
    userId,
    paginate = true,
  }: {
    page?: string;
    status?: string;
    userId?: string;
    paginate?: boolean;
  }): Promise<ModelPaginatorContract<Transaction> | Transaction[]> {
    try {
      const query = Transaction.query();

      if (status) {
        query.where("status", status);
      }

      if (userId) {
        query.where("userId", userId);
      }

      const limit = 15;
      const pageInt = page ? parseInt(page) : 1;
      const transactions = paginate
        ? await query.orderBy("createdAt", "desc").paginate(pageInt, limit)
        : await query.orderBy("createdAt", "desc"); // as ModelPaginatorContract<Transaction>['toJSON']

      return transactions;
    } catch (error) {
      throw error;
    }
  }

  public async getATransaction(id: string): Promise<Transaction> {
    try {
      const transaction = await Transaction.findBy("id", id);
      if (!transaction) {
        throw new NotFoundException("Transaction with this ID not found");
      }

      return transaction;
    } catch (error) {
      throw error;
    }
  }

  public async updateATransaction(
    id: string,
    payload: Partial<
      Omit<TCreateTransaction, "userId" | "anonanceOrderId" | "kudaOrderId">
    >,
  ): Promise<void> {
    try {
      await Transaction.query()
        .where("id", id)
        .update({ ...payload });
      return;
    } catch (error) {
      throw error;
    }
  }

  public async createTransaction(
    payload: TCreateTransaction,
  ): Promise<Transaction> {
    try {
      const transaction = await Transaction.create(payload);
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  public async getCompletedBinanceTransaction(
    orderNo: string,
  ): Promise<Transaction | null> {
    try {
      const transaction = await Transaction.query()
        .where("binance_order_id", orderNo)
        .andWhere("status", TRANSACTION_STATUS.COMPLETED)
        .first();
      return transaction;
    } catch (error) {
      throw error;
    }
  }
}
