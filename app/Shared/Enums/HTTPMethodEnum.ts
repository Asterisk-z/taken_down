export const HTTP_TYPE = {
  POST: 'POST',
  GET: 'GET',
} as const

export type HttpType = (typeof HTTP_TYPE)[keyof typeof HTTP_TYPE]
