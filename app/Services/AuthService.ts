import { TLogin, TLogout } from 'App/Shared/Types/AuthType'
import UserRepository from '@ioc:App/Repositories/UserRepository'
import UserRepositoryData from 'App/Repositories/Model/UserRepositoryModel'
import { TServiceResponse } from 'App/Shared/Types/ServiceResponseType'
import User from 'App/Models/User'
import ForbiddenException from 'App/Exceptions/ForbiddenException'

export class AuthService {
  private static userRespository: UserRepository = new UserRepositoryData()
  public static async login({ email, password, auth }: TLogin): Promise<TServiceResponse<any>> {
    try {
      const { isFirstLogin, type, isActive } = await this.userRespository.getUserByEmail(email)
      if (!isActive) {
        throw new ForbiddenException('Account is currently inactive')
      }

      const token = await auth.use('api').attempt(email, password, {
        expiresIn: '1 day',
      })
      return {
        status: true,
        message: 'User logged in',
        data: { token, isFirstLogin: Boolean(isFirstLogin), type },
      }
    } catch (error) {
      throw error
    }
  }

  public static async logout({ auth }: TLogout): Promise<TServiceResponse<null>> {
    try {
      auth.use('api').revoke()

      return {
        status: true,
        message: 'User logged out',
        data: null,
      }
    } catch (error) {
      throw error
    }
  }

  public static async user(userId: string): Promise<TServiceResponse<User>> {
    try {
      const user = await this.userRespository.getUser(userId)
      return {
        status: true,
        message: 'User details',
        data: user,
      }
    } catch (error) {
      throw error
    }
  }
}
