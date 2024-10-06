// @ts-nocheck

import { Link, Navigate, replace, useLocation, useNavigate } from 'react-router-dom'
import HomePageHeader from './HomePageHeader'
import { Button } from './ui/button'
import { useGlobalContext } from '@/context/GlobalContext'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import UserSchema from '@/utils/LoginUserSchema'
import { ReloadIcon } from '@radix-ui/react-icons'
import ErrorInput from './InputError'
import axios from 'axios'
import useAuth from '@/hooks/useAuth'
import { Checkbox } from './ui/checkbox'
import useLogout from '@/hooks/useLogout'

export default function LoginPageMain() {
  const { auth, setAuth, persist, setPersist } = useAuth()
  const { globalState, setGlobalState } = useGlobalContext()
  const { toast } = useToast()
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [authorized, setAuthorized] = useState(true)
  const location = useLocation()
  const logout = useLogout()

  useEffect(() => {
    if (auth?.accessToken) {
      localStorage.removeItem('persist')
      setAuth({})
      const out = () => {
        logout()
      }
      out()
    }
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(UserSchema), mode: 'onSubmit' })

  useEffect(() => {
    if (globalState.successRegisterMessage.length > 1) {
      toast({
        description: globalState.successRegisterMessage,
      })
      setTimeout(() => {
        setGlobalState((prev) => ({ ...prev, successRegisterMessage: '' }))
      }, 10000)
    }

    if (globalState.unauthorizedRedirectMessage.length > 1 && !auth?.accessToken) {
      toast({
        description: globalState.unauthorizedRedirectMessage,
      })
      setTimeout(() => {
        setGlobalState((prev) => ({ ...prev, unauthorizedRedirectMessage: '' }))
      }, 10000)
    }
  }, [globalState.successRegisterMessage, globalState.unauthorizedRedirectMessage])

  const onSubmit = async (data) => {
    setLoading(true)
    axios
      .post(
        'http://localhost:3000/login',
        {
          email: data.email,
          password: data.password,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.status === 200) {
          const accessToken = response.data
          setAuth({
            username: response.data.username,
            email: watch('email'),
            password: watch('password'),
            accessToken: accessToken.accessToken,
            id: response.data.id,
          })
          setSuccess(true)
          setLoading(false)
          setFetchError(null)
        }
      })
      .catch((error) => {
        if (error.response?.data.message === 'Invalid email') {
          setError('email', { type: 'custom', message: 'Invalid email' })
          setLoading(false)
          setFetchError(null)
          return
        }
        if (error.response?.data.message === 'Invalid password') {
          setError('password', { type: 'custom', message: 'Invalid password' })
          setLoading(false)
          setFetchError(null)
          return
        }
      })
  }

  const togglePersist = () => {
    setPersist((prev) => !prev)
  }

  useEffect(() => {
    localStorage.setItem('persist', persist)
  }, [persist])

  return (
    <main className="w-full h-full">
      {success ? <Navigate to="/socket/home" state={{ from: location }} replace /> : null}
      <div className="w-full h-full flex items-center justify-center">
        <HomePageHeader />
        <div className="py-4 px-8 w-2/5">
          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-1.5 relative">
              <Label className="text-xl">Email</Label>
              <Input
                disabled={loading ? true : false}
                {...register('email')}
                className={
                  'rounded py-5 cursor-pointer hover:bg-slate-100' +
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
              <Label className="text-xl">Password</Label>
              <Input
                disabled={loading ? true : false}
                {...register('password')}
                className={
                  'rounded py-5 cursor-pointer hover:bg-slate-100' +
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
              <div className="flex gap-1.5 relative items-center justify-start mt-2">
                <Checkbox onCheckedChange={togglePersist} checked={persist} />
                <Label>Trust This Device</Label>
              </div>
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
                  'Login'
                )}
              </Button>
            </div>
          </form>
          <div className="w-full grid mt-4">
            <Link to={'/registration'} className="flex items-center justify-center">
              <Button variant={'link'} className="text-center">
                Don't have an account? Register here.
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
