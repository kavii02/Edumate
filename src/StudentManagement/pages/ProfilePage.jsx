import { useState } from 'react'
import { User } from 'lucide-react'

const AVATAR_OPTIONS = [
  { emoji: '🙂', color: 'bg-purple-600' },
  { emoji: '😎', color: 'bg-cyan-600' },
  { emoji: '🧠', color: 'bg-emerald-600' },
  { emoji: '📚', color: 'bg-indigo-600' },
  { emoji: '💡', color: 'bg-yellow-500' }
]

export default function ProfilePage({ studentProfile, setStudentProfile, points, badges, triggerToast }) {
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    name: studentProfile.name,
    email: studentProfile.email,
    school: studentProfile.school || 'Uva Wellassa University',
    avatarEmoji: studentProfile.avatarEmoji || '🙂',
    avatarColor: studentProfile.avatarColor || 'bg-purple-600'
  })

  const handleSave = () => {
    setStudentProfile((prev) => ({
      ...prev,
      name: form.name,
      email: form.email,
      school: form.school,
      avatarEmoji: form.avatarEmoji,
      avatarColor: form.avatarColor
    }))
    setEditMode(false)
    triggerToast?.('Profile updated successfully!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Student Profile</h2>
          <p className="text-sm text-slate-400">View and edit your account details.</p>
        </div>
        {!editMode ? (
          <button type="button" onClick={() => setEditMode(true)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-sm font-bold">Save</button>
            <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700">Cancel</button>
          </div>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-start gap-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl text-white ${form.avatarColor}`}>
            {form.avatarEmoji}
          </div>
          <div className="flex-1 space-y-4">
            {editMode ? (
              <>
                <label className="block">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Full Name</span>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl px-3 py-2 bg-slate-900 border border-slate-800 text-white text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Email</span>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-xl px-3 py-2 bg-slate-900 border border-slate-800 text-white text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">School</span>
                  <input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} className="mt-1 w-full rounded-xl px-3 py-2 bg-slate-900 border border-slate-800 text-white text-sm" />
                </label>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Profile Picture</span>
                  <div className="flex gap-2">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.emoji}
                        type="button"
                        onClick={() => setForm({ ...form, avatarEmoji: opt.emoji, avatarColor: opt.color })}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${opt.color} ${form.avatarEmoji === opt.emoji ? 'ring-2 ring-cyan-400' : ''}`}
                      >
                        {opt.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <User size={18} className="text-cyan-400" />
                  <h3 className="text-xl font-bold text-white">{studentProfile.name}</h3>
                </div>
                <p className="text-sm text-slate-400">{studentProfile.email}</p>
                <p className="text-sm text-slate-300"><strong>Index:</strong> {studentProfile.indexNo}</p>
                <p className="text-sm text-slate-300"><strong>School:</strong> {studentProfile.school || 'Uva Wellassa University'}</p>
                <p className="text-sm text-slate-300"><strong>Points:</strong> {points}</p>
                <p className="text-sm text-slate-300"><strong>Badges:</strong> {badges.filter((b) => b.unlocked).map((b) => b.name).join(', ') || 'None yet'}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
