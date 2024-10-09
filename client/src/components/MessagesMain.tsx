// @ts-nocheck

import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import Messanger from './Messanger'
import { axiosPrivate } from '@/api/axios'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import useAuth from '@/hooks/useAuth'
import { ReloadIcon } from '@radix-ui/react-icons'
import deleteIcon from '../assets/images/delete-svgrepo-com.svg'
import { useToast } from '@/hooks/use-toast'
import { useGlobalContext } from '@/context/GlobalContext'

export default function MessagesMain() {
  const { toast } = useToast()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [sock] = useOutletContext()
  const { state } = useLocation()
  const {
    conversationIdFromLocation,
    showMessagesFromState,
    companionFromState,
    createConversation,
    createIdFromState,
  } = state || false
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [showMessages, setShowMessages] = useState(showMessagesFromState || false)
  const [conversationId, setConversationId] = useState(conversationIdFromLocation || '')
  const [companion, setCompanion] = useState(companionFromState || '')
  const [focus, setFocus] = useState('')
  const { globalState, setGlobalState } = useGlobalContext()

  useEffect(() => {
    if (conversationId === globalState?.conversationId) {
      setGlobalState((prev) => ({ ...prev, newMessage: null, conversationId: '' }))
    }
  }, [conversationId])

  const handleCreateConversation = async () => {
    const controller = new AbortController()

    try {
      const response = await axiosPrivate.post(`http://localhost:3000/message/conversations/new`, {
        signal: controller.signal,
        id1: auth.id,
        id2: companion,
      })
      console.log(response)
      if (response.data) {
        setConversations((prev) => [...prev, response.data])
      }
      setConversationId(reponse.data._id)
      setShowMessages(true)
    } catch (err) {
      console.error(err)
    }

    return () => {
      controller.abort()
    }
  }

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getMessages = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/message/conversations/${auth?.id}`, {
          signal: controller.signal,
        })
        if (response.status === 200 && isMounted) {
          setConversations(response.data)
          setLoading(false)
        }
        if (response.status === 101 && isMounted) {
          setConversations([])
          setLoading(false)
        }
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
  }, [])

  useEffect(() => {
    if (conversations.length && createIdFromState) {
      console.log(conversations)
      const conversation = conversations.find((c) => c.participants.some((p) => p._id === createIdFromState))

      if (conversation) {
        setConversationId(conversation._id)
        setShowMessages(true)
      } else {
        handleCreateConversation()
      }
    } else if (createIdFromState && !conversations.length) {
      handleCreateConversation()
    }
  }, [createIdFromState, conversations])

  const handleDeleteConversation = async (id) => {
    sock.emit('deleteConversation', { conversationId: id, currentUserId: auth.id })
  }

  useEffect(() => {
    sock.on('messageReceived', ({ populatedMessage }) => {
      console.log('recieved')
      setConversations((prevConversations) =>
        prevConversations.map((conversation) =>
          conversation._id === populatedMessage.conversationId
            ? {
                ...conversation,
                lastMessage: populatedMessage,
              }
            : conversation
        )
      )
    })
    sock.on('messageDelivered', ({ populatedMessage }) => {
      setConversations((prevConversations) =>
        prevConversations.map((conversation) =>
          conversation._id === populatedMessage.conversationId
            ? {
                ...conversation,
                lastMessage: populatedMessage,
              }
            : conversation
        )
      )
    })
    sock.on('conversationDeleted', ({ conversationId }) => {
      console.log('con deleted')
      setShowMessages(false)
      setConversations((prevConversations) =>
        prevConversations.filter((conversation) => conversation._id !== conversationId)
      )
      navigate('/socket/messages', { state: null })
    })

    sock.on('conversationDeletedByOtherUser', ({ conversationId }) => {
      console.log('conversation deleted')
      setConversations((prevConversations) =>
        prevConversations.filter((conversation) => conversation._id !== conversationId)
      )
      toast({
        title: 'Conversation deleted by other user',
      })
    })

    return () => {
      sock.off('messageReceived')
      sock.off('messageDelivered')
      sock.off('conversationDeleted')
      sock.off('conversationDeletedByOtherUser')
    }
  }, [sock])

  return (
    <main className="h-full w-full flex items-center justify-center absolute inset-0 z-10">
      <div className="border rounded-lg shadow-md w-3/4 h-2/3">
        <div className="flex flex-grow h-full">
          <div className="w-2/5 border-r overflow-y-auto text-ellipsis">
            {loading ? (
              <div className="grid gap-6 items-center justify-center h-full">
                <div>
                  <ReloadIcon className="animate-spin size-56 mb-6" />
                  <h1 className="text-center text-3xl">Loading...</h1>
                </div>
              </div>
            ) : (
              <>
                {conversations?.length === 0 ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div>No conversations yet</div>
                  </div>
                ) : (
                  conversations?.map((conversation) => (
                    <div
                      onClick={() => {
                        {
                          setCompanion(
                            conversation?.participants.filter((participant) => participant._id !== auth?.id)[0]._id
                          )
                          setConversationId(conversation?._id)
                          setShowMessages(true)
                        }
                      }}
                      key={conversation?._id}
                      className={
                        conversationId === conversation._id
                          ? 'p-2 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden grid gap-3 bg-slate-100'
                          : 'p-2 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden grid gap-3'
                      }
                      style={{ backgroundColor: globalState?.conversationId === conversation._id ? '#fef2f2' : '' }}
                    >
                      <div
                        className={
                          globalState?.conversationId === conversation._id
                            ? 'flex items-center justify-between animate-pulse'
                            : 'flex items-center justify-between'
                        }
                      >
                        <h4 className="font-bold">
                          {conversation?.participants.filter((participant) => participant._id !== auth?.id)[0].username}
                        </h4>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteConversation(conversation._id)
                          }}
                        >
                          <img src={deleteIcon} alt="delete" className="size-6 hover:scale-110 transition-all" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="truncate">
                          {conversation?.lastMessage ? conversation?.lastMessage.content : 'No messages'}
                        </p>
                        <span className="text-sm">
                          {conversation?.lastMessage
                            ? new Date(conversation?.lastMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      <hr />
                    </div>
                  ))
                )}
              </>
            )}
          </div>
          <div className="w-3/5">
            {showMessages ? <Messanger conversationId={conversationId} companion={companion} /> : null}
          </div>
        </div>
      </div>
    </main>
  )
}
