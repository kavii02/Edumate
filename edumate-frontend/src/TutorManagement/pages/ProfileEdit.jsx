const ProfileEdit = () => {
  return (
    <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-8 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
      <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
      <p className="mt-4 text-slate-300">
        Update your profile details and upload a new profile picture here.
      </p>
      <div className="mt-8 space-y-4">
        <label className="block text-slate-200">
          <span className="block text-sm text-slate-400">Full Name</span>
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400" type="text" placeholder="Enter your name" />
        </label>
        <label className="block text-slate-200">
          <span className="block text-sm text-slate-400">Email</span>
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400" type="email" placeholder="you@example.com" />
        </label>
        <label className="block text-slate-200">
          <span className="block text-sm text-slate-400">Profile Image</span>
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400" type="file" accept="image/*" />
        </label>
        <button className="mt-4 rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit;
