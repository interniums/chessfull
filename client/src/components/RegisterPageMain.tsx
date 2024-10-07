// @ts-nocheck

import { Link, Navigate, useNavigate } from 'react-router-dom'
import HomePageHeader from './HomePageHeader'
import { Button } from './ui/button'
import { useForm } from 'react-hook-form'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import ErrorInput from './InputError'
import { motion } from 'framer-motion'
import UserSchema from '@/utils/RegisterUserSchema'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { ReloadIcon } from '@radix-ui/react-icons'
import { useGlobalContext } from '@/context/GlobalContext'

export default function RegisterPageMain() {
  const { globalState, setGlobalState } = useGlobalContext()
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(UserSchema), mode: 'onChange' })

  const onSubmit = async (data) => {
    setLoading(true)
    axios
      .post(
        'http://localhost:3000/registration',
        {
          email: data?.email,
          password: data?.password,
          username: data?.username,
        },
        {
          headers: {
            Authorization: 'skip-auth',
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          setFetchError(null)
          setSuccess(true)
          setGlobalState((prev) => ({
            ...prev,
            successRegisterMessage: `${response.data.message}`,
          }))
          setLoading(false)
        }
      })
      .catch((error) => {
        if (error.response.data.message === 'Email already registred') {
          setError('email', {
            type: 'custom',
            message: 'Email already registred',
          })
          setLoading(false)
          setFetchError(null)
          return
        }
        if (error.response.data.message === 'Username already taken') {
          setError('username', {
            type: 'custom',
            message: 'Username already taken',
          })
          setLoading(false)
          setFetchError(null)
          return
        }
      })
  }

  return (
    <main className="w-full h-full">
      {success && <Navigate to={'/login'} />}
      <div className="w-full h-full flex items-center justify-center">
        <HomePageHeader />
        <div className="py-4 px-8 w-2/5">
          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-1.5 relative">
              <Label className="text-2xl">Email</Label>
              <Input
                {...register('email')}
                disabled={loading ? true : false}
                autoComplete="off"
                className={
                  'rounded py-5 cursor-pointer hover:bg-slate-100 font-medium' +
                  `${errors.email && watch('email').length ? ' border-red-500 border-2 focus-visible:ring-0' : ' '}`
                }
                placeholder="email"
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && watch('email').length ? (
                <ErrorInput
                  top={'-10%'}
                  right={'-20%'}
                  value={errors.email?.message}
                  fontSize={'14px'}
                  color={'white'}
                  borderRadius={'5px'}
                  transitionTime={1}
                  px={'20px'}
                  py={'8px'}
                />
              ) : null}
            </div>
            <div className="grid gap-1.5 relative">
              <Label className="text-2xl">Username</Label>
              <Input
                {...register('username')}
                disabled={loading ? true : false}
                autoComplete="off"
                className={
                  'rounded py-5 cursor-pointer hover:bg-slate-100 font-medium' +
                  `${
                    errors.username && watch('username').length ? ' border-red-500 border-2 focus-visible:ring-0' : ' '
                  }`
                }
                type="text"
                placeholder="username"
                aria-invalid={errors.username ? 'true' : 'false'}
              />
              {errors.username && watch('username').length ? (
                <ErrorInput
                  top={'-10%'}
                  right={'-20%'}
                  value={errors.username?.message}
                  fontSize={'14px'}
                  color={'white'}
                  borderRadius={'5px'}
                  transitionTime={1}
                  px={'20px'}
                  py={'8px'}
                />
              ) : null}
            </div>
            <div className="grid gap-1.5 relative">
              <Label className="text-2xl">Password</Label>
              <Input
                {...register('password')}
                disabled={loading ? true : false}
                autoComplete="off"
                className={
                  'rounded py-5 cursor-pointer hover:bg-slate-100 font-medium' +
                  `${
                    errors.password && watch('password').length ? ' border-red-500 border-2 focus-visible:ring-0' : ' '
                  }`
                }
                type="password"
                placeholder="password"
              />
              {errors.password && watch('password').length ? (
                <ErrorInput
                  top={'-10%'}
                  right={'-20%'}
                  value={errors.password?.message}
                  fontSize={'14px'}
                  color={'white'}
                  borderRadius={'5px'}
                  transitionTime={1}
                  px={'20px'}
                  py={'8px'}
                />
              ) : null}
            </div>
            <div className="grid gap-1.5 relative">
              <Label className="text-2xl">Confirm password</Label>
              <Input
                disabled={loading ? true : false}
                {...register('passwordConfirmation')}
                autoComplete="off"
                type="password"
                className={
                  'rounded py-5 cursor-pointer hover:bg-slate-100 font-medium' +
                  `${
                    errors.passwordConfirmation && watch('passwordConfirmation').length
                      ? ' border-red-500 border-2 focus-visible:ring-0'
                      : ' '
                  }`
                }
                placeholder="confirm password"
              />
              {errors.passwordConfirmation && watch('passwordConfirmation').length ? (
                <ErrorInput
                  top={'-10%'}
                  right={'-20%'}
                  value={errors.passwordConfirmation?.message}
                  fontSize={'14px'}
                  color={'white'}
                  borderRadius={'5px'}
                  transitionTime={1}
                  px={'20px'}
                  py={'8px'}
                />
              ) : null}
              <Button
                type="submit"
                variant={'outline'}
                className="text-2xl py-6 w-full mt-8"
                disabled={loading ? true : false}
              >
                {loading ? (
                  <>
                    <ReloadIcon className="animate-spin size-6 mr-2" />
                    Loading
                  </>
                ) : (
                  'Register'
                )}
              </Button>
            </div>
          </form>
          <div className="w-full grid mt-4">
            <Link to={'/login'} className="flex items-center justify-center">
              <Button variant={'link'} className="text-center">
                Already registred? Login here.
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
