export const USERTYPE = {
  ADMIN: 'admin',
  USER: 'user',
} as const

export type UserType = (typeof USERTYPE)[keyof typeof USERTYPE]
