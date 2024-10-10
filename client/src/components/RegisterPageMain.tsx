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
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 800)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 800)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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
        'https://chessfull-production.up.railway.app/registration',
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
        <div className="w-5/6 sm:w-3/5 md:w-3/5 lg:w-2/5">
          <form className="grid gap-2 sm:gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-1.5 relative">
              <Label className="text-xl sm:text-2xl">Email</Label>
              <Input
                {...register('email')}
                disabled={loading ? true : false}
                autoComplete="off"
                className={
                  'rounded py-4 sm:py-5 cursor-pointer hover:bg-slate-100 font-medium text-xs sm:text-sm' +
                  `${
                    errors.email && watch('email').length
                      ? ' border-red-500 border sm:border-2 focus-visible:ring-0'
                      : ' '
                  }`
                }
                placeholder="email"
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {!isSmallScreen && errors.email && watch('email').length ? (
                <ErrorInput
                  top={'-1%'}
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
              {isSmallScreen && errors.email && watch('email').length ? (
                <div className="pl-2 text-xs sm:text-lg" style={{ color: 'rgb(239 68 68)' }}>
                  {errors.email?.message}
                </div>
              ) : null}
            </div>
            <div className="grid gap-1.5 relative">
              <Label className="text-xl sm:text-2xl ">Username</Label>
              <Input
                {...register('username')}
                disabled={loading ? true : false}
                autoComplete="off"
                className={
                  'rounded py-4 sm:py-5 cursor-pointer hover:bg-slate-100 font-medium text-xs sm:text-sm' +
                  `${
                    errors.username && watch('username').length
                      ? ' border-red-500 border sm:border-2 focus-visible:ring-0'
                      : ' '
                  }`
                }
                type="text"
                placeholder="username"
                aria-invalid={errors.username ? 'true' : 'false'}
              />
              {!isSmallScreen && errors.username && watch('username').length ? (
                <ErrorInput
                  top={'-1%'}
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
              {isSmallScreen && errors.username && watch('username').length ? (
                <div className="pl-2 text-xs sm:text-lg" style={{ color: 'rgb(239 68 68)' }}>
                  {errors.username?.message}
                </div>
              ) : null}
            </div>
            <div className="grid gap-1.5 relative">
              <Label className="text-xl sm:text-2xl ">Password</Label>
              <Input
                {...register('password')}
                disabled={loading ? true : false}
                autoComplete="off"
                className={
                  'rounded py-4 sm:py-5 cursor-pointer hover:bg-slate-100 font-medium text-xs sm:text-sm' +
                  `${
                    errors.password && watch('password').length
                      ? ' border-red-500 border sm:border-2 focus-visible:ring-0'
                      : ' '
                  }`
                }
                type="password"
                placeholder="password"
              />
              {!isSmallScreen && errors.password && watch('password').length ? (
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
              {isSmallScreen && errors.password && watch('password').length ? (
                <div className="pl-2 text-xs sm:text-lg" style={{ color: 'rgb(239 68 68)' }}>
                  {errors.password?.message}
                </div>
              ) : null}
            </div>
            <div className="grid gap-1.5 relative">
              <Label className="text-xl sm:text-2xl ">Confirm password</Label>
              <Input
                disabled={loading ? true : false}
                {...register('passwordConfirmation')}
                autoComplete="off"
                type="password"
                className={
                  'rounded py-4 sm:py-5 cursor-pointer hover:bg-slate-100 font-medium text-xs sm:text-sm' +
                  `${
                    errors.passwordConfirmation && watch('passwordConfirmation').length
                      ? ' border-red-500 border sm:border-2 focus-visible:ring-0'
                      : ' '
                  }`
                }
                placeholder="confirm password"
              />
              {!isSmallScreen && errors.passwordConfirmation && watch('passwordConfirmation').length ? (
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
              {isSmallScreen && errors.passwordConfirmation && watch('passwordConfirmation').length ? (
                <div className="pl-2 text-xs sm:text-lg" style={{ color: 'rgb(239 68 68)' }}>
                  {errors.passwordConfirmation?.message}
                </div>
              ) : null}
              <Button
                type="submit"
                variant={'outline'}
                className="text-lg py-5 sm:text-2xl sm:py-6 w-full mt-4 sm:mt-8"
                disabled={loading ? true : false}
              >
                {loading ? (
                  <>
                    <ReloadIcon className="animate-spin sm:size-6 size-4 mr-2" />
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
              <Button variant={'link'} className="text-xs sm:text-sm text-center text-ellipsis">
                Already registred? Login here.
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
