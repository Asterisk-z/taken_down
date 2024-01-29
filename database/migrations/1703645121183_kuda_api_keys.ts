import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'kuda_api_keys'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('account_number', 10).after('api_key')
      table.string('account_name').after('account_number')
      table.string('narration').after('account_name')
      table.string('notification_email').after('narration')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('account_number')
      table.dropColumn('account_name')
      table.dropColumn('narration')
      table.dropColumn('notification_email')
    })
  }
}
