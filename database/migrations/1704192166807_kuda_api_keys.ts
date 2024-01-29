import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'kuda_api_keys'

  public async up() {
    // this.schema.raw(
    //   `
    //   ALTER TABLE kuda_api_keys DROP CONSTRAINT kuda_api_keys_email_unique;
    //   ALTER TABLE kuda_api_keys DROP INDEX kuda_api_keys_email_unique;
    //   `
    // )
  }

  public async down() {}
}
