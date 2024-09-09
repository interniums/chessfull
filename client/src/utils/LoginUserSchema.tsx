// @ts-nocheck
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email(),
  password: z
    .string()
    .min(8, { message: 'Password should contain at least 8 characters' })
    .max(24, {
      message: 'Password should not contain more than 24 characters',
    }),
})

export default UserSchema
