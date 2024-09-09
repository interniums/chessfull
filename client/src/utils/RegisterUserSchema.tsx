// @ts-nocheck
import { z } from 'zod'

const UserSchema = z
  .object({
    email: z.string().min(1, { message: 'Email is required' }).email(),
    username: z
      .string()
      .min(3, { message: 'Username should contain at least 3 characters' })
      .max(16, {
        message: 'Username should not contain more than 16 characters',
      })
      .regex(/^[a-zA-Z][a-zA-Z0-9_-]{2,15}$/),
    password: z
      .string()
      .min(8, { message: 'Password should contain at least 8 characters' })
      .max(24, {
        message: 'Password should not contain more than 24 characters',
      }),
    passwordConfirmation: z.string().min(8).max(24),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  })

export default UserSchema
