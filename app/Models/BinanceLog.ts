import { DateTime } from 'luxon'
import {
  afterFind,
  beforeCreate,
  beforeFetch,
  beforeFind,
  beforeSave,
  column,
} from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from 'App/Models/AppBaseModel'
import { softDeleteQuery, softDelete } from 'App/Actions/SoftDeleteAction'
import { v4 } from 'uuid'

export default class BinanceLog extends AppBaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public request: string

  @column()
  public response: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  public deletedAt: DateTime

  @beforeCreate()
  public static async assignUuid(binanceLog: BinanceLog) {
    binanceLog.id = v4()
  }

  @beforeSave()
  public static async encodeJSON(binanceLog: BinanceLog) {
    if (binanceLog.$dirty.response) {
      binanceLog.response = JSON.stringify(binanceLog.response)
    }
    if (binanceLog.$dirty.request) {
      binanceLog.request = JSON.stringify(binanceLog.request)
    }
  }

  @afterFind()
  public static prepareFetchResponse(binanceLog: BinanceLog) {
    binanceLog.response = JSON.parse(binanceLog.response)
    binanceLog.request = JSON.parse(binanceLog.request)
  }

  @beforeFind()
  public static softDeletesFind = softDeleteQuery

  @beforeFetch()
  public static softDeletesFetch = softDeleteQuery

  public async softDelete(column?: string) {
    await softDelete(this, column)
  }
}
