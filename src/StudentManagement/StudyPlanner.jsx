import React, { useState } from 'react'
import { Sparkles, CalendarDays } from 'lucide-react'
import PageBackBar from './PageBackBar'
import './Student.css'

export default function StudyPlanner({
  plannerTasks,
  newTaskText,
  newTaskDate,
  setNewTaskText,
  setNewTaskDate,
  handleAddTask,
  handleToggleTask,
  handleDeleteTask,
  handleEditTask,
  handleGenerateSchedule,
  onBack,
  backLabel = 'Dashboard'
}) {
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editDate, setEditDate] = useState('')

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditText(task.text)
    setEditDate(task.date)
  }

  const saveEdit = (taskId) => {
    if (!editText.trim()) return
    handleEditTask?.(taskId, { text: editText, date: editDate || new Date().toISOString().split('T')[0] })
    setEditingId(null)
  }
  const sortedTasks = [...plannerTasks].sort((a, b) => a.date.localeCompare(b.date))
  const upcomingByDate = sortedTasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = []
    acc[task.date].push(task)
    return acc
  }, {})

  const completedCount = plannerTasks.filter((t) => t.completed).length
  const aiCount = plannerTasks.filter((t) => t.isAI).length

  return (
    <div className="space-y-6">
      {onBack && <PageBackBar label={backLabel} onBack={onBack} />}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Study Planner</h2>
          <p className="text-sm text-slate-400 max-w-2xl">Manage your course goals, generate AI schedules from performance data, and track study checkpoints.</p>
        </div>
        <button
          type="button"
          onClick={handleGenerateSchedule}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white hover:opacity-95"
        >
          <Sparkles size={16} />
          Generate Study Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-900 text-center">
          <p className="text-2xl font-black text-white">{plannerTasks.length}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Total Tasks</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-900 text-center">
          <p className="text-2xl font-black text-emerald-400">{completedCount}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Completed</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-900 text-center">
          <p className="text-2xl font-black text-purple-400">{aiCount}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest">AI Suggested</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={18} className="text-cyan-400" />
              <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold">Weekly Schedule View</h3>
            </div>
            {Object.keys(upcomingByDate).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(upcomingByDate).map(([date, tasks]) => (
                  <div key={date} className="border-l-2 border-cyan-500/40 pl-4">
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">{date}</p>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div key={task.id} className={`text-sm px-3 py-2 rounded-xl ${task.completed ? 'bg-slate-900/50 text-slate-500 line-through' : 'bg-slate-900/80 text-slate-200'}`}>
                          {task.text} {task.isAI && <span className="text-[10px] text-purple-400 font-bold">AI</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No tasks scheduled. Add a task or generate a schedule.</p>
            )}
          </div>

          <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">All Tasks</h3>
            <div className="space-y-4">
              {plannerTasks.map((task) => (
                <div key={task.id} className="rounded-3xl border border-slate-850 bg-slate-900/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {editingId === task.id ? (
                    <div className="flex-1 space-y-2">
                      <input value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full rounded-xl px-3 py-2 bg-slate-950 border border-slate-800 text-sm text-white" />
                      <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full rounded-xl px-3 py-2 bg-slate-950 border border-slate-800 text-sm text-white" />
                    </div>
                  ) : (
                    <div>
                      <p className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.text}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{task.date} {task.isAI ? '• AI task' : ''}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {editingId === task.id ? (
                      <>
                        <button type="button" onClick={() => saveEdit(task.id)} className="rounded-2xl px-3 py-2 text-xs font-semibold bg-cyan-500 text-slate-950">Save</button>
                        <button type="button" onClick={() => setEditingId(null)} className="rounded-2xl px-3 py-2 text-xs font-semibold bg-slate-800 text-slate-200">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(task)} className="rounded-2xl px-3 py-2 text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700">Edit</button>
                        <button type="button" onClick={() => handleToggleTask(task.id)} className={`rounded-2xl px-3 py-2 text-xs font-semibold ${task.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}>
                          {task.completed ? 'Undo' : 'Done'}
                        </button>
                        <button type="button" onClick={() => handleDeleteTask(task.id)} className="rounded-2xl px-3 py-2 text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20">
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/10 h-fit">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">Add new goal</h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-[0.3em] font-semibold mb-2 block">Task</label>
              <input
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Write a new study task"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-[0.3em] font-semibold mb-2 block">Date</label>
              <input
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                type="date"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 text-sm font-bold text-white hover:opacity-95">
              Add to planner
            </button>
          </form>
        </aside>
      </div>
    </div>
  )
}
