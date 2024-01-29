import { beforeSave, column } from "@ioc:Adonis/Lucid/Orm";
import AppBaseModel from "./AppBaseModel";

import Hash from '@ioc:Adonis/Core/Hash'
export default class OTP extends AppBaseModel {
  @column({isPrimary:true})
  public id : string

  @column()
  public userId: string

  @column()
  public otp: string

  @column()
  public expiresAt: number

  @beforeSave()
  public static async hash(otp: OTP) {

    if (otp.$dirty.otp) {
      otp.otp = await Hash.make(otp.otp)
    }
  }


}
