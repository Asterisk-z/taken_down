import UserRepository from '@ioc:App/Repositories/UserRepository'
import User from 'App/Models/User'
import UserOtpRepository from 'App/Repositories/Model/UserOTPsRepository'
// import User from 'App/Models/User'
import UserRepositoryData from 'App/Repositories/Model/UserRepositoryModel'
import { TServiceResponse } from 'App/Shared/Types/ServiceResponseType'
import { TCreateProfile } from 'App/Shared/Types/UserRequestType'
import { HelperUtil } from 'App/Utils/HelperUtil'
import { NodeMailerServiceProvider } from 'App/Services/ExternalProviders/Email/NodeMailerProvider'
import { SendchampServiceProvider } from 'App/Services/ExternalProviders/SMS/SendchampServiceProvider'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'

import Hash from '@ioc:Adonis/Core/Hash'
import NotFoundException from 'App/Exceptions/NotFoundException'

export class UserService {
  private static userRespository: UserRepository = new UserRepositoryData()
  private static userOTPRepository: UserOtpRepository = new UserOtpRepository()

  public static async ToggleUser(id: string): Promise<TServiceResponse<null>> {
    try {
      const user = await this.userRespository.getUser(id)
      user.isActive = !user.isActive
      await user.save()

      return {
        status: true,
        message: `User has been ${user.isActive ? 'deactivated' : 'activated'}`,
        data: null,
      }
    } catch (error) {
      throw error
    }
  }

  public static async addUser(email: string): Promise<TServiceResponse<object>> {
    try {
      const password = HelperUtil.generateAlphaNumeric()
      await this.userRespository.adminAddUser({ email, password })
      const message = `
        <p>
          Welcome to anonance, login in to your account with the following details
        </p>
        <p>
          Url: <a href="https://bms.anonance.com/login">https://bms.anonance.com/login</a>
        </p>
        <p>
          Email: ${email}
        </p>
        <p>
          Password: ${password}
        </p>
        `
      await NodeMailerServiceProvider.send({
        recipient: email,
        subject: 'Welcome to annonace',
        message,
      })
      return {
        status: true,
        message: 'User invite created',
        data: null,
      }
    } catch (error) {
      throw error
    }
  }

  public static async createProfile(
    payload: TCreateProfile
  ): Promise<TServiceResponse<{ otp: string }>> {
    try {
      const OTP = HelperUtil.generateNumeric(4)
      const messasge = `Your OTP is ${OTP}`
      await SendchampServiceProvider.sendSMS({
        recipient: [payload.phoneNumber],
        message: messasge,
      })
      payload.otp = OTP
      await this.userRespository.createProfile(payload)
      return {
        status: true,
        message: 'User profile created',
        data: { otp: OTP },
      }
    } catch (error) {
      throw error
    }
  }

  public static async verifyPhoneNumber(
    userId: string,
    otp: string
  ): Promise<TServiceResponse<null>> {
    try {
      await this.userRespository.verifyPhoneNumber(userId, otp)
      return {
        status: true,
        message: 'User verified successfully',
        data: null,
      }
    } catch (error) {
      throw error
    }
  }

  public static async GetAllUser(
    page?: string
  ): Promise<TServiceResponse<ModelPaginatorContract<User>>> {
    try {
      const users = await this.userRespository.getAllUser(page)
      return {
        status: true,
        message: 'All user fetched successfully',
        data: users,
      }
    } catch (error) {
      throw error
    }
  }
  public static async GetAUser(userId: string): Promise<TServiceResponse<{ user: User }>> {
    try {
      const user = await this.userRespository.getUser(userId)
      return {
        status: true,
        message: 'User datails fetched successfully',
        data: { user },
      }
    } catch (error) {
      throw error
    }
  }

  public static async ForgotPassword(email: string): Promise<TServiceResponse<unknown>> {
    try {
      const user = await this.userRespository.getUserByEmail(email)
      console.log('user', user)
      const { otp } = await this.userOTPRepository.createOTP(user.id)
      console.log(otp)

      const message = `

        <p>
          Dear ${user.firstName},
        </p>
        <p>
            Your one-time password for resetting your password is
        </p>
        <p>
            ${otp}
        </p>

`
      await NodeMailerServiceProvider.send({
        recipient: user.email,
        message,
        subject: 'One-time pin for Password reset',
      })

      return {
        status: true,
        message: 'OTP for reset password has been sent successfully',
        data: null,
      }
    } catch (error) {
      throw error
    }
  }
  public static async ResetPassword(
    email: string,
    otp: string,
    password: string
  ): Promise<TServiceResponse<unknown>> {
    try {
      const user = await this.userRespository.getUserByEmail(email)

      const otpDoc = await this.userOTPRepository.GetOTP(user.id)

      if (!otpDoc) {
        throw new NotFoundException('OTP does not exist')
      }

      if (!(await Hash.verify(otpDoc.otp, otp))) {
        await this.userOTPRepository.DeleteUserOTP(user.id)
        throw new NotFoundException('Invalid OTP', 400)
      }
      if (otpDoc.expiresAt > Date.now()) {
        await this.userOTPRepository.DeleteUserOTP(user.id)
        throw new NotFoundException('OTP has Expired ', 400)
      }
      if (!(await Hash.verify(user.password, password))) {
        throw new NotFoundException('New password cannot be the same as the old', 403)
      }
      await this.userOTPRepository.DeleteUserOTP(user.id)
      await this.userRespository.updateUser(user.id, { password })
      return {
        status: true,
        message: 'Password has been reset successfully',
        data: null,
      }
    } catch (error) {
      throw error
    }
  }
}
