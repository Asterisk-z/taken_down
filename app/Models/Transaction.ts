import {
  beforeCreate,
  beforeFetch,
  beforeFind,
  column,
} from "@ioc:Adonis/Lucid/Orm";
import { softDelete, softDeleteQuery } from "App/Actions/SoftDeleteAction";
import AppBaseModel from "App/Models/AppBaseModel";
import { TransactionStatusType } from "App/Shared/Enums/TransactionEnums";
import { DateTime } from "luxon";
import { v4 } from "uuid";

export default class Transaction extends AppBaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public ref: string;

  @column()
  public binanceOrderId: string;

  @column()
  public requestRef: string;

  @column()
  public accountName: string;

  @column()
  public accountNumber: string;

  @column()
  public bank: string;

  @column()
  public bankCode: string;

  @column()
  public bankCharges: number;

  @column()
  public amount: number;

  @column()
  public status: TransactionStatusType;

  @column()
  public cancelationReason: string;

  @column()
  public kudaTransactionReference: string;

  @column()
  public currency: string;

  @column()
  public userId: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @column.dateTime({ serializeAs: null })
  public deletedAt: DateTime;

  @beforeCreate()
  public static async assignUuid(transaction: Transaction) {
    transaction.id = v4();
  }

  @beforeFind()
  public static softDeletesFind = softDeleteQuery;

  @beforeFetch()
  public static softDeletesFetch = softDeleteQuery;

  public async softDelete(column?: string) {
    await softDelete(this, column);
  }
}
