// @ts-nocheck

import { axiosPrivate } from '@/api/axios'
import useAuth from '@/hooks/useAuth'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useOutletContext } from 'react-router-dom'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { PaperPlaneIcon, ReloadIcon } from '@radix-ui/react-icons'
import send from '../assets/images/send-alt-2-svgrepo-com.svg'
import leftArrow from '../assets/images/left-arrow-svgrepo-com.svg'

export default function Messanger({ conversationId, companion, setShowMessages, setConversationId }) {
  const { auth } = useAuth()
  const axiosPrivate = useAxiosPrivate()
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sock] = useOutletContext()
  const messageContainerRef = useRef(null)
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getMessages = async () => {
      try {
        const response = await axiosPrivate.get(
          `https://chessfull-production.up.railway.app/message/${conversationId}`,
          {
            signal: controller.signal,
          }
        )
        console.log(response)
        isMounted && setMessages(response.data)
        setLoading(false)
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
  }, [conversationId])

  const sendMessage = () => {
    const message = {
      conversationId,
      sender: auth?.id,
      content: newMessage,
      createdAt: Date.now(),
    }

    sock.emit('sendMessage', { message, companion })
    setNewMessage('')
  }

  useEffect(() => {
    sock.on('messageReceived', ({ populatedMessage }) => {
      console.log('message recieved')
      setMessages((prevMessages) => [...prevMessages, populatedMessage])
    })
    sock.on('messageDelivered', ({ populatedMessage }) => {
      console.log('message delivered')
      setMessages((prev) => [...prev, populatedMessage])
    })

    return () => {
      sock.off('messageReceived')
      sock.off('messageDelivered')
    }
  }, [sock])

  return (
    <div className="h-full py-4 relative">
      {loading ? (
        <div className="grid gap-6 items-center justify-center h-full">
          <div>
            <ReloadIcon className="animate-spin size-56 mb-6" />
            <h1 className="text-center text-3xl">Loading...</h1>
          </div>
        </div>
      ) : (
        <>
          <div ref={messageContainerRef} className="overflow-y-auto px-4" style={{ height: '90%' }}>
            {!messages.length ? (
              <>
                {isSmallScreen ? (
                  <div>
                    <Button
                      onClick={() => {
                        setConversationId('')
                        setShowMessages(false)
                      }}
                      variant={'outline'}
                      className="w-full text-xl"
                    >
                      Back
                    </Button>
                  </div>
                ) : null}
                <div className="w-full h-4/5 flex items-center justify-center">
                  <div>No messages yet...</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  {isSmallScreen ? (
                    <div>
                      <Button
                        onClick={() => {
                          setConversationId('')
                          setShowMessages(false)
                        }}
                        variant={'outline'}
                        className="w-full text-xl"
                      >
                        Back
                      </Button>
                    </div>
                  ) : null}
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
              </>
            )}
          </div>
        </>
      )}
      {loading ? null : (
        <form
          style={{ height: '10%' }}
          className="h-1/6 px-4 flex items-end justify-center gap-8 sticky bottom-0"
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="cursor-pointer" />
          <Button className="text-lg flex items-center justify-center gap-2" variant={'outline'}>
            <img src={send} alt="send" className="size-10" />
          </Button>
        </form>
      )}
    </div>
  )
}
