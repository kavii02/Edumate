import { useState, useEffect } from "react";
import {
  BellRing, Plus, Edit3, Trash2, X, BookOpen,
  CheckCircle, RefreshCw, Megaphone,
} from "lucide-react";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getTutorCourses,
} from "../services/tutorApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

const Announcements = () => {
  const { tutorId } = useTutorAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", course_id: "" });

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    const [aRes, cRes] = await Promise.all([
      getAnnouncements(tutorId),
      getTutorCourses(tutorId),
    ]);
    if (aRes.success) setAnnouncements(aRes.announcements || []);
    if (cRes.success) setCourses(cRes.courses || []);
    setLoading(false);
  };

  useEffect(() => { if (tutorId) loadData(); }, [tutorId]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ title: "", content: "", course_id: "" });
    setShowForm(true);
  };

  const openEdit = (ann) => {
    setEditTarget(ann.announcement_id);
    setForm({ title: ann.title, content: ann.content, course_id: ann.course_id || "" });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditTarget(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showMsg("Title is required.", "error"); return; }
    if (!form.content.trim()) { showMsg("Content is required.", "error"); return; }
    setSubmitting(true);
    const payload = { title: form.title.trim(), content: form.content.trim(), course_id: form.course_id ? parseInt(form.course_id) : null };
    const res = editTarget ? await updateAnnouncement(editTarget, payload) : await createAnnouncement(tutorId, payload);
    if (res.success) {
      showMsg(editTarget ? "Announcement updated." : "Announcement published!");
      closeForm();
      await loadData();
    } else {
      showMsg(res.message || "Operation failed.", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement? Students will no longer see it.")) return;
    const res = await deleteAnnouncement(id);
    if (res.success) {
      showMsg("Announcement deleted.");
      setAnnouncements((prev) => prev.filter((a) => a.announcement_id !== id));
    } else {
      showMsg(res.message || "Failed to delete.", "error");
    }
  };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_35%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-purple-300/70">Tutor Dashboard</p>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-slate-400 text-sm mt-1">Publish updates and notifications for your students.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-400/30 bg-purple-400/10 text-purple-300 text-sm hover:bg-purple-400/20 transition">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition shadow-[0_0_18px_rgba(168,85,247,0.5)]">
            <Plus size={14} /> New Announcement
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${message.type === "error" ? "border border-red-400/30 bg-red-400/10 text-red-300" : "border border-green-400/30 bg-green-400/10 text-green-300"}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="rounded-3xl border border-purple-400/40 bg-[#041225]/90 p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Megaphone size={20} className="text-purple-300" />
              {editTarget ? "Edit Announcement" : "New Announcement"}
            </h2>
            <button onClick={closeForm} className="text-slate-400 hover:text-white"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Title <span className="text-purple-400">*</span></label>
              <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Quiz 2 – Date Changed"
                className="w-full rounded-xl bg-slate-900/80 border border-slate-600 px-4 py-2.5 text-sm outline-none focus:border-purple-400 placeholder-slate-500" maxLength={200} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Course (optional)</label>
              <select value={form.course_id} onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value }))}
                className="w-full rounded-xl bg-slate-900/80 border border-slate-600 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-400">
                <option value="">— All Students (No specific course) —</option>
                {courses.map((c) => <option key={c.course_id} value={c.course_id}>{c.course_title || c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Content <span className="text-purple-400">*</span></label>
              <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write your announcement here…" rows={5}
                className="w-full rounded-xl bg-slate-900/80 border border-slate-600 px-4 py-3 text-sm outline-none focus:border-purple-400 placeholder-slate-500 resize-y" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition disabled:opacity-50">
                {submitting ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {submitting ? "Saving…" : (editTarget ? "Update" : "Publish")}
              </button>
              <button type="button" onClick={closeForm}
                className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40 text-purple-300 gap-2">
          <RefreshCw size={18} className="animate-spin" /> Loading announcements…
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-3xl border border-slate-700/40 bg-[#041225]/80 p-12 text-center">
          <BellRing size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No announcements yet.</p>
          <p className="text-slate-600 text-sm mt-1">Click "New Announcement" to publish one for your students.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.announcement_id} className="rounded-2xl border border-purple-400/20 bg-[#041225]/80 p-5 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:border-purple-400/35 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h3 className="text-lg font-semibold text-white">{ann.title}</h3>
                    {ann.course_title && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25 text-cyan-300">
                        <BookOpen size={10} /> {ann.course_title}
                      </span>
                    )}
                    {!ann.course_id && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-400/10 border border-purple-400/25 text-purple-300">All Students</span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  <p className="text-slate-600 text-xs mt-2">{formatDate(ann.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(ann)} className="p-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-400/30 transition" title="Edit">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => handleDelete(ann.announcement_id)} className="p-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
