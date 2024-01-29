import { ModelPaginatorContract } from "@ioc:Adonis/Lucid/Orm";
import Transaction from "App/Models/Transaction";
import { TCreateTransaction } from "App/Shared/Types/TransactionType";
export default interface TransactionRepositoryInterface {
  SearchTransaction(
    payload: {
      name?: string;
      bank?: string;
      accountNumber?: string;
      id?: string;
    },
  ): Promise<Transaction[]>;
  createTransaction(payload: TCreateTransaction): Promise<Transaction>;
  getAllTransaction({
    status,
    userId,
    page,
    paginate,
  }: {
    status?: string;
    userId?: string;
    page?: string;
    paginate?: boolean;
  }): Promise<ModelPaginatorContract<Transaction> | Transaction[]>;
  getATransaction(id: string): Promise<Transaction>;
  updateATransaction(
    id: string,
    payload: Partial<Omit<TCreateTransaction, "userId" | "ref" | "requestRef">>,
  ): Promise<void>;
  getCompletedBinanceTransaction(orderNo: string): Promise<Transaction | null>;
}
