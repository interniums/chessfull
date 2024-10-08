// @ts-nocheck

import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import Messanger from './Messanger'
import { axiosPrivate } from '@/api/axios'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import useAuth from '@/hooks/useAuth'
import { ReloadIcon } from '@radix-ui/react-icons'

export default function MessagesMain() {
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [sock] = useOutletContext()
  const { state } = useLocation()
  const { conversationIdFromLocation, showMessagesFromState, companionFromState, createConversation, createId } =
    state || false
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [showMessages, setShowMessages] = useState(showMessagesFromState || false)
  const [conversationId, setConversationId] = useState(conversationIdFromLocation || '')
  const [companion, setCompanion] = useState(companionFromState || '')
  console.log(createId)

  const handleCreateConversation = async () => {
    const controller = new AbortController()
    setLoading(true)

    try {
      const response = await axiosPrivate.post(`http://localhost:3000/message/conversations/new`, {
        signal: controller.signal,
        id1: auth.id,
        id2: companion,
      })
      console.log(response)
      setConversationId(reponse.data._id)
      setShowMessages(true)
      setLoading(false)
    } catch (err) {
      console.error(err)
    }

    return () => {
      setLoading(false)
      controller.abort()
    }
  }

  useEffect(() => {
    if (createId) {
      const conversation = conversations.find((conversation) => conversation.participants.includes(createId))
      console.log(conversation)

      const conversationID = conversation ? conversation._id : false

      if (!conversationID) {
        handleCreateConversation()
      } else {
        setConversationId(conversationID)
        setShowMessages(true)
      }
    }
  }, [conversations, loading])

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getMessages = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/message/conversations/${auth?.id}`, {
          signal: controller.signal,
        })
        // console.log(response)
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
                      className="p-2 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden"
                    >
                      <h4 className="font-bold">
                        {conversation?.participants.filter((participant) => participant._id !== auth?.id)[0].username}
                      </h4>
                      <p className="truncate">
                        {conversation?.lastMessage ? conversation?.lastMessage.content : 'No messages'}
                      </p>
                      <span className="text-sm">
                        {new Date(
                          conversation?.lastMessage ? conversation?.lastMessage.createdAt : null
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
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
