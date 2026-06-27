import React, { useState, useEffect } from 'react'
import './Student.css'

export default function StudentPeerLearning({
  peerLearningPeers,
  handleSendPeerRequest,
  buildWeakAreasSummary,
  openPeerChatId,
  setOpenPeerChatId,
  peerChatMessages,
  handleSendPeerChatMessage,
  handleSendPeerAttachment,
  handlePeerAcceptedConnection,
  handlePeerDeclineConnection,
  handleEndPeerConnection,
  embedded = false
}) {
  const [chatInput, setChatInput] = useState('')
  const [attachmentError, setAttachmentError] = useState('')
  const [viewPeer, setViewPeer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showChatModal, setShowChatModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)

  const incomingRequests = peerLearningPeers.filter((p) => p.status === 'incoming')
  const allSuggestedPeers = peerLearningPeers.filter((p) => p.status !== 'incoming')
  const suggestedPeers = allSuggestedPeers.filter((peer) => {
    const query = searchQuery.toLowerCase()
    return peer.name.toLowerCase().includes(query) || peer.expertise.toLowerCase().includes(query) || peer.field.toLowerCase().includes(query)
  })

  const activePeer = peerLearningPeers.find((peer) => peer.id === openPeerChatId)
  const messages = peerChatMessages[openPeerChatId] || []

  useEffect(() => {
    if (!openPeerChatId) {
      const connectedPeer = peerLearningPeers.find((peer) => peer.status === 'connected')
      if (connectedPeer) {
        setOpenPeerChatId(connectedPeer.id)
      }
    }
  }, [openPeerChatId, peerLearningPeers, setOpenPeerChatId])

  const handleChatSubmit = () => {
    if (!chatInput.trim() || !activePeer) return
    handleSendPeerChatMessage(openPeerChatId, {
      sender: 'me',
      type: 'text',
      content: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    setChatInput('')
  }

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0]
    if (!file || !activePeer) return
    if (!['application/pdf', 'image/png', 'image/jpg', 'image/jpeg', 'audio/mpeg', 'audio/wav', 'audio/mp3'].some((type) => file.type === type || file.type.startsWith('image/'))) {
      setAttachmentError('Only PDF, image, or audio files are supported.')
      return
    }
    setAttachmentError('')
    handleSendPeerAttachment(openPeerChatId, file)
    event.target.value = ''
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' })
        if (activePeer) {
          handleSendPeerAttachment(openPeerChatId, file)
        }
        stream.getTracks().forEach((track) => track.stop())
      }
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      setAttachmentError('Microphone access denied. Please allow microphone access to record voice notes.')
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  return (
    <div className="space-y-6">
      {viewPeer && (
        <div div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-4 overflow-hidden">
          <div className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold mb-2">Peer Profile</p>
                <h3 className="text-2xl font-bold text-white">{viewPeer.name}</h3>
                <p className="text-sm text-slate-400">{viewPeer.expertise} • {viewPeer.field}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setViewPeer(null) }} className="px-3 py-2 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">Close</button>
              </div>
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <p><strong>Why suggested:</strong> {viewPeer.reason}</p>
              <p><strong>Mutual interest:</strong> {viewPeer.mutualInterest}</p>
              <p><strong>Rating:</strong> {viewPeer.rating} / 5.0</p>
              <p><strong>Achievements:</strong> {viewPeer.achievements || 'Not public'}</p>
              <div className="mt-4 flex gap-3">
                {viewPeer.status === 'incoming' ? (
                  <>
                    <button onClick={() => { handlePeerAcceptedConnection(viewPeer.id); setViewPeer(null) }} className="py-3 px-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold">Accept</button>
                    <button onClick={() => { handlePeerDeclineConnection(viewPeer.id); setViewPeer(null) }} className="py-3 px-4 rounded-2xl bg-slate-800 text-slate-200 font-bold border border-slate-700">Decline</button>
                  </>
                ) : viewPeer.status === 'connected' ? (
                  <button onClick={() => { setOpenPeerChatId(viewPeer.id); setViewPeer(null) }} className="py-3 px-4 rounded-2xl bg-cyan-500 text-slate-950 font-bold">Open Chat</button>
                ) : (
                  <button onClick={() => { handleSendPeerRequest(viewPeer.id); setViewPeer(null) }} className="py-3 px-4 rounded-2xl bg-cyan-500 text-slate-950 font-bold">Send Request</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {!embedded && (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-slate-800 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold mb-2">Peer Learning Hub</p>
            <h2 className="text-2xl font-black text-white">Connect with peers who excel in your weak subjects</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Review suggested collaborators based on your performance gaps, send study requests, and start chat sessions when a connection is accepted.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Weak Areas</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{buildWeakAreasSummary()}</p>
          </div>
        </div>
      </div>
      )}

      {embedded && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3 text-sm text-slate-400">
          <span className="text-cyan-400 font-semibold">Weak areas: </span>{buildWeakAreasSummary()}
        </div>
      )}

      {incomingRequests.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold">Incoming Requests</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {incomingRequests.map((peer) => (
              <div key={peer.id} className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-sm hover:border-cyan-500/20 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{peer.name}</h3>
                    <p className="text-sm text-slate-400">Expert in {peer.expertise}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] bg-amber-500/15 text-amber-300 border border-amber-500/20">Incoming</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setViewPeer(peer)} className="py-2 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">View Profile</button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <p><strong>Strong field:</strong> {peer.field}</p>
                  <p><strong>Why suggested:</strong> {peer.reason}</p>
                  <p><strong>Mutual interest:</strong> {peer.mutualInterest}</p>
                  <p><strong>Rating:</strong> {peer.rating} / 5.0</p>
                </div>
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => handlePeerAcceptedConnection(peer.id)}
                    className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
                  >
                    Accept Request
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeerDeclineConnection(peer.id)}
                    className="w-full py-3 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    Decline Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {peerLearningPeers.filter((peer) => peer.status === 'connected').length > 0 && (
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold">Connected Peers</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {peerLearningPeers.filter((peer) => peer.status === 'connected').map((peer) => (
              <div key={peer.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
                <div className="mb-3">
                  <h4 className="font-semibold text-white text-sm">{peer.name}</h4>
                  <p className="text-xs text-slate-400">{peer.expertise}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpenPeerChatId(peer.id)
                    setShowChatModal(true)
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
                >
                  Open Chat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold">Search Peers</p>
        <input
          type="text"
          placeholder="Search by name, expertise, or field..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {suggestedPeers.map((peer) => (
          <div key={peer.id} className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-sm hover:border-cyan-500/20 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{peer.name}</h3>
                <p className="text-sm text-slate-400">Expert in {peer.expertise}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] ${peer.status === 'connected' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : peer.status === 'requested' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                {peer.status === 'requested' ? 'Requested' : peer.status === 'connected' ? 'Connected' : 'Suggested'}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setViewPeer(peer)} className="py-2 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">View Profile</button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p><strong>Strong field:</strong> {peer.field}</p>
              <p><strong>Why suggested:</strong> {peer.reason}</p>
              <p><strong>Mutual interest:</strong> {peer.mutualInterest}</p>
              <p><strong>Rating:</strong> {peer.rating} / 5.0</p>
            </div>
            {peer.status === 'available' && (
              <button
                type="button"
                onClick={() => handleSendPeerRequest(peer.id)}
                className="mt-5 w-full py-3 rounded-2xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
              >
                Send Request
              </button>
            )}
            {peer.status === 'requested' && (
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-2xl bg-slate-800 text-slate-500 text-xs font-bold border border-slate-700"
                >
                  Request Sent
                </button>
                <p className="text-xs text-slate-500">Waiting for the other party to accept before the chat opens.</p>
              </div>
            )}
            {peer.status === 'incoming' && (
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => handlePeerAcceptedConnection(peer.id)}
                  className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
                >
                  Accept Request
                </button>
                <button
                  type="button"
                  onClick={() => handlePeerDeclineConnection(peer.id)}
                  className="w-full py-3 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  Decline Request
                </button>
              </div>
            )}
            {peer.status === 'connected' && (
              <button
                type="button"
                onClick={() => setOpenPeerChatId(peer.id)}
                className="mt-5 w-full py-3 rounded-2xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
              >
                Open Chat
              </button>
            )}
          </div>
        ))}
      </div>

      {showChatModal && activePeer && activePeer.status === 'connected' && (
        <div div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-4 overflow-hidden">
          <div className="w-full max-w-6xl max-h-[calc(100vh-2rem)] rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl overflow-y-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold">Live Peer Chat</p>
                <h3 className="text-2xl font-black text-white">Chat with {activePeer.name}</h3>
                <p className="text-sm text-slate-400">Share notes, PDFs, images, voice notes, and coordinate study sessions.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowChatModal(false)}
                className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                Close Chat
              </button>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-4">
              <div className="h-[410px] overflow-y-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-5 text-sm text-slate-200">
                {messages.length === 0 ? (
                  <div className="text-slate-500">No messages yet. Start the conversation with a quick note or attachment.</div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`mb-4 ${message.sender === 'me' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-full rounded-3xl px-4 py-3 ${message.sender === 'me' ? 'bg-cyan-500/15 text-cyan-100' : 'bg-slate-800 text-slate-200'}`}>
                        {message.type === 'text' && <p>{message.content}</p>}
                        {message.type === 'attachment' && (
                          <div className="space-y-2">
                            {message.fileType.startsWith('image/') && (
                              <img src={URL.createObjectURL(message.file)} alt={message.fileName} className="max-h-48 rounded-2xl border border-slate-700" />
                            )}
                            {message.fileType === 'application/pdf' && (
                              <div className="rounded-2xl bg-slate-900 p-3 border border-slate-700">
                                <p className="font-semibold text-white">PDF shared</p>
                                <p className="text-slate-400 text-xs">{message.fileName}</p>
                              </div>
                            )}
                            {message.fileType.startsWith('audio/') && (
                              <audio controls className="w-full rounded-2xl bg-slate-900 p-2 border border-slate-700">
                                <source src={URL.createObjectURL(message.file)} type={message.fileType} />
                                Your browser does not support audio playback.
                              </audio>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{message.time} • {message.sender === 'me' ? 'You' : activePeer.name}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  rows={3}
                  placeholder="Type your study note or message..."
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500"
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      File
                      <input
                        type="file"
                        accept=".pdf,image/*,audio/*"
                        onChange={handleAttachmentChange}
                        className="mt-2 block w-full text-slate-200"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`mt-7 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-colors ${isRecording ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                    >
                      {isRecording ? '⏹ Stop Recording' : '🎤 Record Voice'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleChatSubmit}
                    className="w-full sm:w-auto rounded-3xl bg-cyan-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-950 hover:bg-cyan-400 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
                {attachmentError && <p className="mt-2 text-sm text-red-400">{attachmentError}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 text-slate-300">
                <h4 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-semibold mb-3">Chat actions</h4>
                <p className="text-sm text-slate-400 mb-4">Use this chat to trade study notes, upload PDFs, share diagrams, and swap quick voice explainers.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    Send a quick note summarizing your weak concept.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    Upload an example PDF or image with your question.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    Share audio voice notes for concept walkthrough and revision.
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 text-slate-300">
                <h4 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-semibold mb-3">Connected peers</h4>
                <div className="space-y-3">
                  {peerLearningPeers.filter((peer) => peer.status === 'connected').map((peer) => (
                    <button
                      key={peer.id}
                      type="button"
                      onClick={() => setOpenPeerChatId(peer.id)}
                      className={`block w-full text-left rounded-3xl border px-4 py-3 text-sm ${peer.id === openPeerChatId ? 'border-cyan-500 bg-slate-800 text-white' : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-cyan-500'}`}
                    >
                      <div className="font-semibold">{peer.name}</div>
                      <p className="text-xs text-slate-500">{peer.expertise}</p>
                    </button>
                  ))}
                  {peerLearningPeers.filter((peer) => peer.status === 'connected').length === 0 && (
                    <div className="text-sm text-slate-500">No connected peers yet. Send a request and open chat when accepted.</div>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleEndPeerConnection(openPeerChatId)}
                    className="w-full py-3 rounded-2xl bg-red-700 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    End Connection
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}
