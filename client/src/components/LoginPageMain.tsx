// @ts-nocheck

import { Link, Navigate, replace, useLocation, useNavigate } from 'react-router-dom'
import HomePageHeader from './HomePageHeader'
import { Button } from './ui/button'
import { useGlobalContext } from '@/context/GlobalContext'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Label } from './ui/label'
import { Input } from './ui/input'
import loadinggif from '../assets/images/loading gif.webp'
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
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 800)
  console.log(isSmallScreen)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 800)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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
        'https://chessfull-production.up.railway.app/login',
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
    <main className="w-full h-full flex items-center justify-center">
      {success ? <Navigate to="/socket/home" state={{ from: location }} replace /> : null}
      <div className="w-5/6 sm:w-3/5 md:w-3/5 lg:w-2/5">
        <form className="grid gap-2 sm:gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5 relative">
            <Label className="text-xl sm:text-2xl ">Email</Label>
            <Input
              disabled={loading ? true : false}
              {...register('email')}
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
            <Label className="text-xl sm:text-2xl">Password</Label>
            <Input
              disabled={loading ? true : false}
              {...register('password')}
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
                top={'-1%'}
                right={'-30%'}
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
            <div className="flex gap-1.5 relative items-center justify-start mt-2">
              <Checkbox onCheckedChange={togglePersist} checked={persist} />
              <Label>
                <p className="text-xs sm:text-sm">Trust This Device</p>
              </Label>
            </div>
            <Button
              type="submit"
              variant={'outline'}
              className="text-lg py-5 sm:text-2xl sm:py-6 w-full mt-4 sm:mt-8"
              disabled={loading ? true : false}
            >
              {loading ? (
                <>
                  {/* <ReloadIcon className="animate-spin sm:size-6 size-4 mr-2" />
                  Loading */}
                  <div className="dot-elastic"></div>
                </>
              ) : (
                'Login'
              )}
            </Button>
          </div>
        </form>
        <div className="w-full grid mt-2 sm:mt-4">
          <Link to={'/registration'} className="flex items-center justify-center">
            <Button variant={'link'} className="text-xs sm:text-sm text-center text-ellipsis">
              Don't have an account? Register here.
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
