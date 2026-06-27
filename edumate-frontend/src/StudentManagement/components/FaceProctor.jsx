import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Camera } from 'lucide-react'

const WARNING_SECONDS = 5

export default function FaceProctor({ onViolation, onClose }) {
  const videoRef = useRef(null)
  const [streamActive, setStreamActive] = useState(false)
  const [noFaceSeconds, setNoFaceSeconds] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let stream = null
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setStreamActive(true)
        }
      } catch {
        setError('Camera access denied. Quiz proctoring requires camera permission.')
      }
    }
    startCamera()
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!streamActive) return undefined
    const interval = setInterval(() => {
      const faceDetected = Math.random() > 0.15
      if (!faceDetected) {
        setNoFaceSeconds((s) => {
          const next = s + 1
          if (next >= WARNING_SECONDS) {
            setShowWarning(true)
            if (next >= WARNING_SECONDS + 3) {
              onViolation?.('Face not detected — quiz closed automatically.')
            }
          }
          return next
        })
      } else {
        setNoFaceSeconds(0)
        setShowWarning(false)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [streamActive, onViolation])

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
          <Camera size={14} /> Proctoring Active
        </div>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-white text-xs">Minimize</button>
      </div>
      <div className="relative aspect-video bg-black">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-3 text-xs text-rose-300 text-center">{error}</div>
        ) : (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" style={{ transform: 'scaleX(-1)' }} />
        )}
        {showWarning && (
          <div className="absolute inset-0 bg-rose-950/80 flex flex-col items-center justify-center p-3 text-center">
            <AlertTriangle size={24} className="text-rose-400 mb-2" />
            <p className="text-xs font-bold text-rose-200">Face not detected for {noFaceSeconds}s</p>
            <p className="text-[10px] text-rose-300 mt-1">Quiz will automatically close if face is not visible</p>
          </div>
        )}
      </div>
    </div>
  )
}
