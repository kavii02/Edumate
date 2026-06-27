import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageBackButton({ to, label = 'previous page' }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="page-back-btn"
    >
      <ArrowLeft size={16} />
      <span>Back to {label}</span>
    </button>
  )
}
