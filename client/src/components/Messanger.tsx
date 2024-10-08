// @ts-nocheck

import { axiosPrivate } from '@/api/axios'
import useAuth from '@/hooks/useAuth'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { useEffect, useState } from 'react'
import { useLocation, useOutletContext } from 'react-router-dom'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { PaperPlaneIcon, ReloadIcon } from '@radix-ui/react-icons'
import send from '../assets/images/send-alt-2-svgrepo-com.svg'

export default function Messanger({ conversationId, companion }) {
  const { auth } = useAuth()
  const axiosPrivate = useAxiosPrivate()
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sock] = useOutletContext()
  const [reloadMessages, setReloadMessages] = useState(null)
  // const [focus, setFocus] = useState(null)

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getMessages = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/message/${conversationId}`, {
          signal: controller.signal,
        })
        console.log(response)
        isMounted && setMessages(response.data)
        setLoading(false)
        setReloadMessages(null)
      } catch (err) {
        console.error(err)
      }
    }

    getMessages()

    return () => {
      setLoading(false)
      isMounted = false
      controller.abort()
    }
  }, [conversationId, reloadMessages])

  const sendMessage = () => {
    const message = {
      conversationId,
      sender: auth?.id,
      content: newMessage,
    }

    sock.emit('sendMessage', { message, companion })
  }

  useEffect(() => {
    sock.on('messageRecieved', ({ message }) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })
    sock.on('messageDelivered', () => {
      setReloadMessages(true)
    })
  }, [sock])

  return (
    <div className="h-full py-4 px-6">
      {loading ? (
        <div className="grid gap-6 items-center justify-center h-full">
          <div>
            <ReloadIcon className="animate-spin size-56 mb-6" />
            <h1 className="text-center text-3xl">Loading...</h1>
          </div>
        </div>
      ) : (
        <>
          <div className="h-5/6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender.username == auth?.username
                    ? 'rounded-lg py-2 px-2 bg-gray-200 h-fit my-4'
                    : 'rounded-lg py-2 px-2 bg-slate-200 h-fit my-4'
                }
              >
                <h1 className="font-bold text-lg">{msg.sender.username}</h1>
                <div className="flex justify-between">
                  <p>{msg.content}</p>
                  <p className="text-sm text-end">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="h-1/6 flex items-center justify-center gap-8">
            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="cursor-pointer" />
            <Button
              className="text-lg flex items-center justify-center gap-2"
              variant={'outline'}
              onClick={() => sendMessage()}
            >
              <img src={send} alt="send" className="size-10" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
