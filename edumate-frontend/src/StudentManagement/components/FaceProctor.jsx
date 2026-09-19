import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Camera, CheckCircle2 } from 'lucide-react'

const WARNING_SECONDS = 5
const MAX_NO_FACE_SECONDS = 8

export default function FaceProctor({ onViolation, onClose }) {
  const videoRef = useRef(null)
  const faceDetectorRef = useRef(null)
  const [streamActive, setStreamActive] = useState(false)
  const [noFaceSeconds, setNoFaceSeconds] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [isFaceVisible, setIsFaceVisible] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let stream = null
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
          audio: false
        })
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

  // Initialize Shape Detection API if supported by browser
  useEffect(() => {
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        faceDetectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
      } catch {
        faceDetectorRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!streamActive) return undefined

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 48
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return

      let detected = false

      if (faceDetectorRef.current) {
        try {
          const faces = await faceDetectorRef.current.detect(videoRef.current)
          detected = faces.length > 0
        } catch {
          detected = false
        }
      }

      // If FaceDetector is not available or produced no detection, fallback to video frame presence analysis
      if (!faceDetectorRef.current || !detected) {
        try {
          ctx.drawImage(videoRef.current, 0, 0, 64, 48)
          const imgData = ctx.getImageData(0, 0, 64, 48).data
          let totalLum = 0
          let minLum = 255
          let maxLum = 0

          for (let i = 0; i < imgData.length; i += 4) {
            const lum = 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2]
            totalLum += lum
            if (lum < minLum) minLum = lum
            if (lum > maxLum) maxLum = lum
          }

          const avgLum = totalLum / (64 * 48)
          const contrast = maxLum - minLum

          // Detected if camera is not covered (black), not blinded by white glare, and has visual contrast
          const hasSufficientFeed = avgLum >= 15 && avgLum <= 240 && contrast >= 25
          if (!faceDetectorRef.current) {
            detected = hasSufficientFeed
          }
        } catch {
          detected = true
        }
      }

      setIsFaceVisible(detected)

      if (!detected) {
        setNoFaceSeconds((s) => {
          const next = s + 1
          if (next >= WARNING_SECONDS) {
            setShowWarning(true)
            if (next >= MAX_NO_FACE_SECONDS) {
              onViolation?.('Academic Integrity Alert: Face not detected for over 8 seconds. Quiz auto-submitted.')
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
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-2xl bg-slate-955 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
          <Camera size={14} /> AI Proctoring Active
        </div>
        <div className="flex items-center gap-2">
          {streamActive && !error && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isFaceVisible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300 animate-pulse'
            }`}>
              {isFaceVisible ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
              {isFaceVisible ? 'Verified' : 'No Face'}
            </span>
          )}
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white text-xs">Minimize</button>
        </div>
      </div>
      <div className="relative aspect-video bg-black">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-3 text-xs text-rose-300 text-center">{error}</div>
        ) : (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" style={{ transform: 'scaleX(-1)' }} />
        )}
        {showWarning && (
          <div className="absolute inset-0 bg-rose-950/85 flex flex-col items-center justify-center p-3 text-center animate-fade-in">
            <AlertTriangle size={24} className="text-rose-400 mb-1 animate-bounce" />
            <p className="text-xs font-bold text-rose-100">Face not detected ({noFaceSeconds}s)</p>
            <p className="text-[10px] text-rose-300 mt-1">
              Please face the camera. Session will auto-terminate in {MAX_NO_FACE_SECONDS - noFaceSeconds}s.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
