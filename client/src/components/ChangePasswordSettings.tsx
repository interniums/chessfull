// @ts-nocheck

import { useState } from 'react'
import { Input } from './ui/input'
import ErrorInput from './InputError'
import { Button } from './ui/button'
import { CheckIcon, ReloadIcon } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { axiosPrivate } from '@/api/axios'
import { useToast } from '@/hooks/use-toast'

export default function ChangePasswordSettings({ editPassword, id }) {
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState('mount')
  const [oldPasswordBadFormat, setOldPasswordBadFormat] = useState(false)
  const [newPasswordBadFormat, setNewPasswordBadFormat] = useState(false)

  const changePassword = async (e) => {
    e.preventDefault()
    if (oldPassword.length < 8 || oldPassword.length > 24) {
      setOldPasswordBadFormat(true)
      return
    }
    if (newPassword.length < 8 || newPassword.length > 24) {
      setNewPasswordBadFormat(true)
      return
    }

    console.log('validate password')
    const controller = new AbortController()
    setPwdLoading(true)

    try {
      const response = await axiosPrivate.patch(`http://localhost:3000/user/${id}/updatePwd`, {
        signal: controller.signal,
        oldPassword,
        newPassword,
      })
      console.log(response)
      if (response.status === 200) {
        setIsPasswordValid('true')
        setPwdLoading(false)
        setEditPassword(false)
        toast({
          title: 'Success',
          description: 'Password successfully changed',
        })
      }
    } catch (err) {
      if (err.response.status === 401) {
        setIsPasswordValid('false')
        setPwdLoading(false)
      }
    }

    return () => {
      controller.abort()
      setPwdLoading(false)
    }
  }

  return (
    <div className="w-full mt-2">
      {editPassword ? (
        <form className="grid gap-3" onSubmit={(e) => changePassword(e)}>
          <h1 className="font-bold text-xl">Change password</h1>
          <div className="relative">
            <Input
              onChange={(e) => {
                setOldPassword(e.target.value)
                setIsPasswordValid('mount')
                setOldPasswordBadFormat(false)
              }}
              className={
                'font-medium text-lg w-full cursor-pointer hover:bg-slate-100' +
                `${
                  isPasswordValid === 'false' || oldPasswordBadFormat
                    ? ' border-red-500 border-2 focus-visible:ring-0'
                    : ' '
                }`
              }
              placeholder="Old password"
              type="password"
            />
            {isPasswordValid === 'false' || oldPasswordBadFormat ? (
              <ErrorInput
                top={'-115%'}
                right={'-20%'}
                value={
                  isPasswordValid === 'false'
                    ? 'Invalid password'
                    : oldPasswordBadFormat
                    ? 'Password should be 8-24 chr.'
                    : null
                }
                fontSize={'14px'}
                color={'white'}
                borderRadius={'5px'}
                transitionTime={1}
                px={'20px'}
                py={'8px'}
              />
            ) : null}
          </div>
          <div className="relative">
            <Input
              onChange={(e) => {
                setNewPassword(e.target.value)
                setNewPasswordBadFormat(false)
              }}
              className={
                'font-medium text-lg w-full cursor-pointer hover:bg-slate-100' +
                `${newPasswordBadFormat ? ' border-red-500 border-2 focus-visible:ring-0' : ' '}`
              }
              placeholder="New password"
            />
            {newPasswordBadFormat ? (
              <ErrorInput
                top={'-115%'}
                right={'-20%'}
                value={newPasswordBadFormat ? 'Password should be 8-24 chr.' : null}
                fontSize={'14px'}
                color={'white'}
                borderRadius={'5px'}
                transitionTime={1}
                px={'20px'}
                py={'8px'}
              />
            ) : null}
          </div>
          <Button disabled={pwdLoading ? true : false} variant={'outline'}>
            {pwdLoading ? (
              <ReloadIcon className="animate-spin size-5" />
            ) : (
              <div className="flex items-center justify-center font-bold text-xl">
                Submit
                <CheckIcon className="ml-2 size-6" />
              </div>
            )}
          </Button>
        </form>
      ) : (
        <Button className="w-full font-bold text-lg" variant={'outline'}>
          Change password
        </Button>
      )}
    </div>
  )
}
