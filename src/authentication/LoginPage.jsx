import { useState } from "react";

const ROLES = ["Admin", "Tutor", "Student"];

const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_30%),radial-gradient(circle_at_70%_0%,rgba(56,189,248,0.2),transparent_25%)]"></div>

        <div className="relative bg-[#0a0f23]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-10 w-full max-w-xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] text-white">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-xl">
              E
            </div>

            <p className="text-xs tracking-widest text-purple-300 uppercase">
              EduMate Portal
            </p>

            <h1 className="text-3xl font-bold mt-2">Select your role</h1>

            <p className="text-gray-400 mt-2">
              Pick the role you want to sign in as
            </p>
          </div>

          {/* Role buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 transition font-semibold"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_30%),radial-gradient(circle_at_70%_0%,rgba(56,189,248,0.2),transparent_25%)]"></div>

      <div className="relative bg-[#0a0f23]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-10 w-full max-w-xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] text-white">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-xl">
            E
          </div>

          <p className="text-xs tracking-widest text-purple-300 uppercase">
            EduMate Portal
          </p>

          <h1 className="text-3xl font-bold mt-2">{role} Login</h1>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(role);
          }}
          className="space-y-5"
        >
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-purple-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-purple-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 to-purple-500 text-black font-bold hover:scale-[1.02] transition">
            Login
          </button>
        </form>

        {/* Back */}
        <button
          onClick={() => setRole(null)}
          className="mt-5 text-gray-400 hover:text-white text-sm"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default LoginPage;