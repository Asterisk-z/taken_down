import UserOtpRepository from "App/Repositories/Model/UserOTPsRepository";
import { TServiceResponse } from "App/Shared/Types/ServiceResponseType";

export class UserOTPService {
  private static repository: UserOtpRepository = new UserOtpRepository()

   public static async CreateUserOTP(userId: string): Promise<TServiceResponse<{otp: string}>> {
    try {
     const otp =  await this.repository.createOTP(userId)

    //TASK : SEND EMAIL WITH THE OTP TO THE USER
      return {
        status: true,
        message:"OTP has been created successfully",
        data: otp
      }
    } catch (error) {
     throw error
    }
  }
}
