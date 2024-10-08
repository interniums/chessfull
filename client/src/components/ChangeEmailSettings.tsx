// @ts-nocheck

import { CheckIcon, Cross2Icon, Pencil1Icon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useEffect, useState } from 'react'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { axiosPrivate } from '@/api/axios'
import { useToast } from '@/hooks/use-toast'
import ErrorInput from './InputError'

export default function ChangeEmailSettings({ setEditEmail, editEmail, email, id, setEmail }) {
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [ifEmailValid, setIfEmailValid] = useState('mount')
  const [initialEmail, setInitialEmail] = useState(email)

  useEffect(() => {
    if (!editEmail) {
      setIfEmailValid('mount')
    }
  }, [editEmail])

  const changeEmail = async (e) => {
    e.preventDefault()
    console.log('change function mounted')
    const emailRegex = /^(?!\s*$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      console.log('regex not passed')
      setIfEmailValid('false')
      return
    }
    const controller = new AbortController()
    setLoading(true)

    try {
      console.log('fetching')
      const response = await axiosPrivate.patch(`http://localhost:3000/user/${id}/updateEmail`, {
        signal: controller.signal,
        email,
      })
      console.log(response)
      if (response.status === 200) {
        setIfEmailValid('true')
        setLoading(false)
        setEditEmail(false)
        toast({
          title: 'Success',
          description: 'Email successfully changed',
        })
      }
    } catch (err) {
      console.log(err)
      if (err?.response.status === 401) {
        setIfEmailValid('dublicate')
        setLoading(false)
      }
      if (err?.response.status === 409) {
        setIfEmailValid('already registered')
        setLoading(false)
      }
    }

    return () => {
      controller.abort()
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h1 className="font-bold mb-2">Email</h1>
      <form className="flex gap-8 w-full" onSubmit={(e) => changeEmail(e)}>
        <div className="relative w-full">
          <Input
            disabled={editEmail ? false : true}
            style={{ textShadow: 'none' }}
            className={
              'font-medium text-l w-full cursor-pointer hover:bg-slate-100' +
              `${
                ifEmailValid === 'dublicate' || ifEmailValid === 'false' || ifEmailValid === 'already registered'
                  ? ' border-red-500 border-2 focus-visible:ring-0'
                  : ' '
              }`
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {ifEmailValid === 'dublicate' || ifEmailValid === 'false' || ifEmailValid === 'already registered' ? (
            <ErrorInput
              top={'-115%'}
              right={'-20%'}
              value={
                ifEmailValid === 'dublicate'
                  ? 'Email not changed'
                  : ifEmailValid === 'false'
                  ? 'This is not email'
                  : ifEmailValid === 'already registered'
                  ? 'This email is already taken'
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
        {editEmail ? (
          <>
            <div className="flex gap-2">
              <Button
                variant={'outline'}
                type="button"
                onClick={(e) => {
                  setEmail(initialEmail)
                  setEditEmail(false)
                  e.preventDefault()
                }}
              >
                <Cross2Icon className="size-4" />
              </Button>
              <Button variant={'outline'} type="submit">
                <CheckIcon className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant={'outline'}
            onClick={(e) => {
              setEditEmail(true)
              e.preventDefault()
            }}
            type="button"
          >
            <Pencil1Icon className="size-4" />
          </Button>
        )}
      </form>
    </div>
  )
}
