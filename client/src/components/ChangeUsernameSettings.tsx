// @ts-nocheck

import { CheckIcon, Cross2Icon, Pencil1Icon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useEffect, useState } from 'react'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { axiosPrivate } from '@/api/axios'
import { useToast } from '@/hooks/use-toast'
import ErrorInput from './InputError'

export default function ChangeUsernameSettings({ setEditName, editName, name, id, setName }) {
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [ifNameValid, setIfNameValid] = useState('mount')
  const [initialName, setInitialName] = useState(name)

  useEffect(() => {
    if (!editName) {
      setIfNameValid('mount')
    }
  }, [editName])

  const changeName = async (e) => {
    e.preventDefault()
    console.log('change function mounted')
    const nameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{3,16}$/
    if (!nameRegex.test(name)) {
      setIfNameValid('false')
      return
    }
    const controller = new AbortController()
    setLoading(true)

    try {
      console.log('fetching')
      const response = await axiosPrivate.patch(
        `https://chessfull-production.up.railway.app/user/${id}/updateUsername`,
        {
          signal: controller.signal,
          name,
        }
      )
      console.log(response)
      if (response.status === 200) {
        setIfNameValid('true')
        setLoading(false)
        setEditName(false)
        toast({
          title: 'Success',
          description: 'Username successfully changed',
        })
      }
    } catch (err) {
      console.log(err)
      if (err?.response.status === 401) {
        setIfNameValid('dublicate')
        setLoading(false)
      }
      if (err?.response.status === 409) {
        setIfNameValid('already registered')
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
      <h1 className="font-bold mb-2 text-xl">Username</h1>
      <form className="flex gap-8 w-full" onSubmit={(e) => changeName(e)}>
        <div className="relative w-full">
          <Input
            disabled={editName ? false : true}
            style={{ textShadow: 'none' }}
            className={
              'font-medium text-lg w-full cursor-pointer hover:bg-slate-100' +
              `${
                ifNameValid === 'dublicate' || ifNameValid === 'false' || ifNameValid === 'already registered'
                  ? ' border-red-500 border-2 focus-visible:ring-0'
                  : ' '
              }`
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {ifNameValid === 'dublicate' || ifNameValid === 'false' || ifNameValid === 'already registered' ? (
            <ErrorInput
              top={'-115%'}
              right={'-20%'}
              value={
                ifNameValid === 'dublicate'
                  ? 'Username not changed'
                  : ifNameValid === 'false'
                  ? 'Invalid username format'
                  : ifNameValid === 'already registered'
                  ? 'This username is already taken'
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
        {editName ? (
          <>
            <div className="flex gap-2">
              <Button
                variant={'outline'}
                type="button"
                onClick={(e) => {
                  setName(initialName)
                  setEditName(false)
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
              setEditName(true)
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
