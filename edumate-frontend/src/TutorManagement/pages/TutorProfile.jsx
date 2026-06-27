import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  CloudUpload,
  Edit3,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getTutorProfile, updateTutorProfile } from "../services/tutorApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

const TutorProfile = () => {
  const { tutorId } = useTutorAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    qualification: "",
    teaching_area: "",
    about: "",
    avatar_url: "",
  });
  const [draft, setDraft] = useState(profile);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!tutorId) return;

    const fetchProfile = async () => {
      const response = await getTutorProfile(tutorId);
      if (response.success) {
        setProfile(response.tutor);
        setDraft(response.tutor);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [tutorId]);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDraft((prev) => ({ ...prev, avatar_url: url }));
  };

  const handleSave = async () => {
    setLoading(true);
    const response = await updateTutorProfile(tutorId, {
      full_name: draft.full_name,
      email: draft.email,
      phone: draft.phone,
      qualification: draft.qualification,
      teaching_area: draft.teaching_area,
      about: draft.about,
      avatar_url: draft.avatar_url,
    });

    if (response.success) {
      setProfile(response.tutor);
      setEditMode(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Failed to update profile: " + response.message);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditMode(false);
    setMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
        <p className="text-slate-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Tutor Profile</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] mt-6">
        <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.45)] text-center">
          <div
            className="w-28 h-28 mx-auto overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.7)]"
            style={{
              backgroundImage: draft.avatar_url
                ? `url(${draft.avatar_url})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!draft.avatar_url && (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-950">
                {draft.full_name?.[0] || "T"}
              </div>
            )}
          </div>

          {editMode && (
            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800">
              <CloudUpload size={18} />
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          <div className="mt-6 space-y-4 text-left">
            {editMode ? (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Name</span>
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={draft.full_name}
                    onChange={handleChange("full_name")}
                    disabled={loading}
                  />
                </label>
              </>
            ) : (
              <>
                <h2 className="mt-5 text-2xl font-bold">{profile.full_name}</h2>
                <p className="text-cyan-300">{profile.qualification || "Tutor"}</p>
              </>
            )}
          </div>

          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-cyan-300 ring-1 ring-cyan-400/30 transition hover:bg-cyan-500/20 disabled:opacity-50"
              onClick={() => setEditMode((value) => !value)}
              disabled={loading}
            >
              <Edit3 size={18} />
              {editMode ? "Exit edit" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
          <h2 className="text-2xl font-semibold mb-6">Personal Details</h2>

          <div className="space-y-5">
            {[
              {
                icon: <Mail className="text-cyan-300" />,
                label: "Email",
                value: draft.email,
                field: "email",
              },
              {
                icon: <Phone className="text-cyan-300" />,
                label: "Phone",
                value: draft.phone,
                field: "phone",
              },
              {
                icon: <GraduationCap className="text-cyan-300" />,
                label: "Qualification",
                value: draft.qualification,
                field: "qualification",
              },
              {
                icon: <BookOpen className="text-cyan-300" />,
                label: "Teaching Area",
                value: draft.teaching_area,
                field: "teaching_area",
              },
            ].map(({ icon, label, value, field }) => (
              <div
                key={label}
                className="flex flex-col gap-3 rounded-2xl bg-slate-900/70 p-4 border border-slate-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  {icon}
                  <div>
                    <p className="text-slate-400 text-sm">{label}</p>
                    {!editMode ? <p>{profile[field] || "Not set"}</p> : null}
                  </div>
                </div>
                {editMode && (
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:w-72 disabled:opacity-50"
                    value={value}
                    onChange={handleChange(field)}
                    disabled={loading}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <h2 className="text-2xl font-semibold">About Tutor</h2>
          {editMode ? (
            <span className="text-sm text-slate-400">Update your summary to show what you teach best.</span>
          ) : null}
        </div>
        {editMode ? (
          <textarea
            className="mt-4 w-full min-h-[150px] rounded-3xl border border-slate-700 bg-slate-950/80 p-4 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            value={draft.about}
            onChange={handleChange("about")}
            disabled={loading}
          />
        ) : (
          <p className="mt-5 text-slate-300 leading-7">{profile.about || "No description yet"}</p>
        )}
      </div>

      {message && (
        <div className={`mt-6 p-4 rounded-2xl text-sm ${
          message.includes("successfully")
            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/50"
            : "bg-rose-500/20 text-rose-200 border border-rose-500/50"
        }`}>
          {message}
        </div>
      )}

      {editMode && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-5 py-3 text-cyan-300 ring-1 ring-cyan-400/30 transition hover:bg-cyan-500/20 disabled:opacity-50"
            onClick={handleSave}
            disabled={loading}
          >
            <CheckCircle size={18} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-5 py-3 text-slate-200 ring-1 ring-slate-700 transition hover:bg-slate-800 disabled:opacity-50"
            onClick={handleCancel}
            disabled={loading}
          >
            <XCircle size={18} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorProfile;
              
