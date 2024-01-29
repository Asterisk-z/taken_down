import { DateTime } from 'luxon'
import {
  afterFind,
  beforeCreate,
  beforeFetch,
  beforeFind,
  beforeSave,
  column,
} from '@ioc:Adonis/Lucid/Orm'
import { softDeleteQuery, softDelete } from 'App/Actions/SoftDeleteAction'
import { v4 } from 'uuid'
import AppBaseModel from 'App/Models/AppBaseModel'
import { KudaServiceType } from 'App/Shared/Enums/KudaEmum'

export default class KudaLog extends AppBaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public ref: string

  @column()
  public serviceType: KudaServiceType

  @column()
  public response: string

  @column()
  public isSuccess: boolean

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  public deletedAt: DateTime

  @beforeCreate()
  public static async assignUuid(kudaLog: KudaLog) {
    kudaLog.id = v4()
  }

  @beforeSave()
  public static async encodeJSON(kudaLog: KudaLog) {
    if (kudaLog.$dirty.response) {
      kudaLog.response = JSON.stringify(kudaLog.response)
    }
  }

  @afterFind()
  public static prepareFetchResponse(kudaLog: KudaLog) {
    kudaLog.response = JSON.parse(kudaLog.response)
  }

  @beforeFind()
  public static softDeletesFind = softDeleteQuery

  @beforeFetch()
  public static softDeletesFetch = softDeleteQuery

  public async softDelete(column?: string) {
    await softDelete(this, column)
  }
}
