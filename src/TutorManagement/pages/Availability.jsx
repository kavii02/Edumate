const Availability = () => {
  return (
    <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-8 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
      <h1 className="text-3xl font-bold text-white">Availability Status</h1>
      <p className="mt-4 text-slate-300">
        Set your teaching availability status so students know when you are available.
      </p>
      <div className="mt-8 space-y-4">
        <label className="block text-slate-200">
          <span className="block text-sm text-slate-400">Status</span>
          <select className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400">
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </label>
        <label className="block text-slate-200">
          <span className="block text-sm text-slate-400">Next available time</span>
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400" type="datetime-local" />
        </label>
      </div>
    </div>
  );
};

export default Availability;
