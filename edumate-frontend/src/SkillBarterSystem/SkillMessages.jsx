import React, { useEffect, useState, useRef } from 'react'
import { MessageCircle, Send, User, RefreshCw } from 'lucide-react'
import './SkillBarter.css'

const API_BASE_URL = 'http://localhost:5000'

export default function SkillMessages() {
  const studentId = parseInt(localStorage.getItem('edumate_student_id') || '1', 10)
  const studentName = localStorage.getItem('edumate_student_name') || 'You'

  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { fetchConversations() }, [])
  useEffect(() => {
    if (activeConv) fetchMessages(activeConv.request_id)
  }, [activeConv])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    setLoadingConvs(true)
    try {
      const [inRes, outRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/skillrequests/incoming/${studentId}`),
        fetch(`${API_BASE_URL}/api/skillrequests/sent/${studentId}`)
      ])
      const inData  = inRes.ok  ? await inRes.json()  : []
      const outData = outRes.ok ? await outRes.json() : []

      const accepted = [
        ...inData.filter(r => r.status === 'Accepted').map(r => ({
          request_id: r.request_id,
          peer_name: r.requester_name,
          skill_name: r.skill_name,
          direction: 'incoming'
        })),
        ...outData.filter(r => r.status === 'Accepted').map(r => ({
          request_id: r.request_id,
          peer_name: r.provider_name,
          skill_name: r.skill_name,
          direction: 'sent'
        }))
      ]

      setConversations(accepted)
      if (accepted.length > 0 && !activeConv) {
        setActiveConv(accepted[0])
      }
    } catch (err) {
      console.error('Fetch convs error:', err)
    } finally {
      setLoadingConvs(false)
    }
  }

  const fetchMessages = async (requestId) => {
    setLoadingMsgs(true)
    try {
      const res  = await fetch(`${API_BASE_URL}/api/skillmessages/${requestId}`)
      const data = res.ok ? await res.json() : []
      setMessages(data)
    } catch (err) {
      console.error('Fetch messages error:', err)
    } finally {
      setLoadingMsgs(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !activeConv) return

    const peerId = activeConv.direction === 'incoming'
      ? messages.find(m => m.sender_id !== studentId)?.sender_id
      : messages.find(m => m.sender_id !== studentId)?.sender_id

    setSending(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/skillmessages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: activeConv.request_id,
          sender_id: studentId,
          receiver_id: peerId || 0,
          message: newMsg.trim()
        })
      })
      if (res.ok) {
        const sent = await res.json()
        setMessages(prev => [...prev, { ...sent, sender_name: studentName }])
        setNewMsg('')
      }
    } catch (err) {
      console.error('Send message error:', err)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="barter-view-panel">
      <div className="view-panel-header row-layout">
        <div>
          <h2>Messages</h2>
          <p>Chat with your accepted barter partners.</p>
        </div>
        <button className="barter-action-btn accent" onClick={fetchConversations}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="messages-layout">

        {/* Conversations list */}
        <aside className="conv-list sb-neon-card">
          <div className="conv-list-header">
            <MessageCircle size={16} />
            <span>Conversations</span>
          </div>
          {loadingConvs ? (
            <p className="empty-pane-msg">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="empty-pane-msg">No accepted barters yet.</p>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.request_id}
                type="button"
                className={`conv-item ${activeConv?.request_id === conv.request_id ? 'active' : ''}`}
                onClick={() => setActiveConv(conv)}
              >
                <div className="conv-avatar">{(conv.peer_name || '?')[0].toUpperCase()}</div>
                <div className="conv-meta">
                  <span className="conv-name">{conv.peer_name}</span>
                  <span className="conv-skill">{conv.skill_name}</span>
                </div>
              </button>
            ))
          )}
        </aside>

        {/* Chat pane */}
        <div className="chat-pane sb-neon-card">
          {!activeConv ? (
            <div className="chat-empty-state">
              <MessageCircle size={36} />
              <p>Select a conversation to start messaging.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="conv-avatar">{(activeConv.peer_name || '?')[0].toUpperCase()}</div>
                <div>
                  <h4>{activeConv.peer_name}</h4>
                  <span>Skill: {activeConv.skill_name}</span>
                </div>
              </div>

              <div className="chat-body">
                {loadingMsgs ? (
                  <p className="empty-pane-msg">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="empty-pane-msg">No messages yet. Say hello!</p>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === studentId
                    return (
                      <div key={msg.message_id} className={`msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                        {!isMine && (
                          <span className="msg-sender-name">{msg.sender_name}</span>
                        )}
                        <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                          {msg.message}
                        </div>
                        <span className="msg-time">{formatTime(msg.sent_at)}</span>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form className="chat-input-row" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="barter-action-btn primary"
                  disabled={sending || !newMsg.trim()}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
