import NotFoundException from 'App/Exceptions/NotFoundException'
import ServerException from 'App/Exceptions/ServerException'
import User from 'App/Models/User'
import { TCreateProfile, UserInterface } from 'App/Shared/Types/UserRequestType'
import UserRepositoryInterface from 'App/Repositories/Interfaces/UserRepositoryInterface'
import { TAdminAddUser } from 'App/Shared/Types/AdminAddUser'
import { USERTYPE } from 'App/Shared/Enums/UserEnum'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'

export default class UserRepositoryModel implements UserRepositoryInterface {
  public async updateUser(id: string, payload: Partial<UserInterface>): Promise<void> {
    try {
      const user = await User.query().where('id', id).first()
      if (!user) {
        throw new NotFoundException('User not found', 404)
      }
      await user.merge({ ...payload }).save()
      return
    } catch (error) {
      throw error
    }
  }
  public async createProfile(payload: TCreateProfile): Promise<User> {
    try {
      const user = await this.queryUser(payload.id)
      user.firstName = payload.firstName
      user.lastName = payload.lastName
      user.password = payload.password
      user.phoneNumber = payload.phoneNumber
      user.binanceUsername = payload.binanceUsername
      // user.otp = payload.otp
      user.isFirstLogin = false
      await user.save()
      return user
    } catch (error) {
      throw new ServerException(error.message || 'Something went wrong')
    }
  }

  public async verifyPhoneNumber(userId: string): Promise<User> {
    try {
      const user = await this.queryUser(userId)
      // const verifyOtp = await Hash.verify(user.otp, otp)
      // if (!verifyOtp) throw new BadRequestException('Invalid OTP provided')
      user.isPhoneNumberVerified = true
      await user.save()
      return user
    } catch (error) {
      throw new ServerException(error.message || 'Something went wrong')
    }
  }

  public async adminAddUser(payload: TAdminAddUser): Promise<string> {
    try {
      await User.create(payload)
      return 'User created successfully'
    } catch (error) {
      throw new ServerException(error.message || 'Something went wrong')
    }
  }

  public async getAllUser(page?: string): Promise<ModelPaginatorContract<User>> {
    try {
      const limit = 15
      const pageInt = page ? parseInt(page) : 1
      const users = await User.query().where('type', USERTYPE.USER).paginate(pageInt, limit)

      return users
    } catch (error) {
      throw error
    }
  }

  public async getUser(userId: string): Promise<User> {
    try {
      return await this.queryUser(userId)
    } catch (error) {
      throw new ServerException(error.message || 'Something went wrong')
    }
  }

  public async getUserByEmail(email: string): Promise<User> {
    try {
      return await this.queryUserByEmail(email)
    } catch (error) {
      throw new ServerException(error.message || 'Something went wrong')
    }
  }

  public async getConnectedActiveUser(): Promise<User[]> {
    try {
      const users = await User.query()
        .where('is_active', true)
        .andWhere('is_first_login', false)
        .andWhere('is_kuda_connected', true)
        .andWhere('is_binance_connected', true)

      return users
    } catch (error) {
      throw new ServerException(error.message || 'Something went wrong')
    }
  }

  private async queryUser(userId: string): Promise<User> {
    try {
      const user = await User.query().where('id', userId).first()
      if (!user) throw new NotFoundException('User record does not exist')
      return user
    } catch (error) {
      throw new ServerException(error.message || 'Something went wrong')
    }
  }

  private async queryUserByEmail(email: string): Promise<User> {
    try {
      const user = await User.query().where('email', email).first()
      if (!user) throw new NotFoundException('User record does not exist')
      return user
    } catch (error) {
      throw new ServerException(error.message || 'Something went wrong')
    }
  }
}
