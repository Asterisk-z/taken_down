import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'

import { v4 } from 'uuid'
import {
  column,
  beforeSave,
  beforeCreate,
  beforeFetch,
  beforeFind,
  computed,
  afterFind,
  HasOne,
  hasOne,
} from '@ioc:Adonis/Lucid/Orm'
import { softDeleteQuery, softDelete } from 'App/Actions/SoftDeleteAction'
import AppBaseModel from 'App/Models/AppBaseModel'
import { UserType } from 'App/Shared/Enums/UserEnum'
import { HelperUtil } from 'App/Utils/HelperUtil'
import KudaApiKey from 'App/Models/KudaApiKey'
import BinanceApiKey from 'App/Models/BinanceApiKey'
import OTP from 'App/Models/UserOTPs'

export default class User extends AppBaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public anonanceId: string

  @column()
  public email: string

  @column()
  public phoneNumber: string

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column()
  public avatar: string

  @column()
  public binanceUsername: string

  // @column({ serializeAs: null })
  // public otp: string

  @column()
  public type: UserType

  @column({ serializeAs: null })
  public isTermsAndConditionsAccepted: boolean

  @column({ serializeAs: null })
  public isRegistrationCompleted: boolean

  @column()
  public isEmailVerified: boolean

  @column()
  public isPhoneNumberVerified: boolean

  @column()
  public isActive: boolean

  @column()
  public isVerified: Boolean

  @column()
  public isFirstLogin: Boolean

  @column()
  public isKudaConnected: boolean

  @column()
  public isBinanceConnected: boolean

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: null })
  public rememberMeToken: string

  @column({ serializeAs: null })
  public token: string

  @hasOne(() => KudaApiKey)
  public kudaKey: HasOne<typeof KudaApiKey>

  @hasOne(() => OTP)
  public otp: HasOne<typeof OTP>

  @hasOne(() => BinanceApiKey)
  public binanceKey: HasOne<typeof BinanceApiKey>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  public deletedAt: DateTime

  @computed()
  public get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  @beforeCreate()
  public static async assignUuid(user: User) {
    user.id = v4()
    user.anonanceId = await HelperUtil.generateUserRef()
  }

  @afterFind()
  public static prepareFetchResponse(user: User) {
    user.isTermsAndConditionsAccepted = !!user.isTermsAndConditionsAccepted
    user.isRegistrationCompleted = !!user.isRegistrationCompleted
    user.isEmailVerified = !!user.isEmailVerified
    user.isPhoneNumberVerified = !!user.isPhoneNumberVerified
    user.isActive = !!user.isActive
    user.isVerified = !!user.isVerified
    user.isFirstLogin = !!user.isFirstLogin
    user.isBinanceConnected = !!user.isBinanceConnected
    user.isKudaConnected = !!user.isKudaConnected
    user.anonanceId = user.anonanceId && user.anonanceId.toUpperCase()
  }

  @beforeSave()
  public static async hash(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
    // if (user.$dirty.otp) {
    //   user.otp = await Hash.make(user.otp)
    // }
  }

  @beforeFind()
  public static softDeletesFind = softDeleteQuery

  @beforeFetch()
  public static softDeletesFetch = softDeleteQuery

  public async softDelete(column?: string) {
    await softDelete(this, column)
  }
}
