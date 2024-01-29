import { UserType } from "../Enums/UserEnum"

export type TCreateProfile = {
  firstName: string
  lastName: string
  phoneNumber: string
  binanceUsername: string
  password: string
  id: string
  otp: string
}

export type UserInterface  = TCreateProfile &  {
  anonoceId: string
  email: string
  avatar: string
  type: UserType
  isActive: boolean
  isVerified: boolean
}
