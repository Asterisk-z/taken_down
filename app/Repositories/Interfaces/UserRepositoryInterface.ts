import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import { TAdminAddUser } from 'App/Shared/Types/AdminAddUser'
import { TCreateProfile, UserInterface } from 'App/Shared/Types/UserRequestType'

export default interface UserRepositoryInterface {
  adminAddUser(payload: TAdminAddUser): Promise<string>
  createProfile(payload: TCreateProfile): Promise<User>
  getUser(userId: string): Promise<User>
  getUserByEmail(email: string): Promise<User>
  verifyPhoneNumber(userId: string, otp: string): Promise<User>
  getAllUser(page?: string): Promise<ModelPaginatorContract<User>>
  updateUser(id: string, payload: Partial<UserInterface>): Promise<void>
  getConnectedActiveUser(): Promise<User[]>
}
