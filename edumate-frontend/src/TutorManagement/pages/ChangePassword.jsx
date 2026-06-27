import { useState } from "react";
import { changePassword } from "../services/tutorApiService";
import { useTutorAuth } from "../context/TutorAuthContext";
import { validatePassword } from "../../services/authApiService";

const ChangePassword = () => {
  const { tutorId } = useTutorAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      setMessage(passwordCheck.message);
      return;
    }

    if (!tutorId) {
      setMessage("You must be logged in to change your password.");
      return;
    }

    setLoading(true);
    const response = await changePassword(tutorId, currentPassword, newPassword);

    if (response.success) {
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(response.message || "Failed to change password");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-8 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
      <h1 className="text-3xl font-bold text-white">Change Password</h1>
      <p className="mt-4 text-slate-300">
        Update your password to keep your account secure.
      </p>
      <p className="mt-2 text-sm text-slate-400">
        New password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.
      </p>
      <form className="mt-8 space-y-4" onSubmit={handleChangePassword}>
        <label className="block">
          <span className="text-slate-400">Current Password</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
          />
        </label>
        <label className="block">
          <span className="text-slate-400">New Password</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
        </label>
        <label className="block">
          <span className="text-slate-400">Confirm New Password</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </label>

        {message && (
          <div
            className={`p-4 rounded-2xl text-sm ${
              message.includes("successfully")
                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/50"
                : "bg-rose-500/20 text-rose-200 border border-rose-500/50"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
