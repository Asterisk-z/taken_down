import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { TRANSACTION_STATUS } from 'App/Shared/Enums/TransactionEnums'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('ref').notNullable()
      table.string('binance_order_id').notNullable()
      table.string('request_ref').notNullable()
      table.string('kuda_transaction_reference').defaultTo(null)
      table.string('account_name').notNullable()
      table.string('account_number', 15).notNullable()
      table.string('bank').notNullable()
      table.string('bank_code').notNullable()
      table.float('bank_charges').nullable()
      table.float('amount').notNullable()
      table
        .enum('status', Object.values(TRANSACTION_STATUS))
        .notNullable()
        .defaultTo(TRANSACTION_STATUS.PENDING)
      table.string('cancelation_reason')
      table.string('currency').defaultTo('NGN')
      table.uuid('user_id').notNullable().references('users.id').notNullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.dateTime('deleted_at').defaultTo(null)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
