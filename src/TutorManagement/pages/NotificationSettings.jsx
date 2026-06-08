const NotificationSettings = () => {
  return (
    <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-8 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
      <h1 className="text-3xl font-bold text-white">Notification Settings</h1>
      <p className="mt-4 text-slate-300">
        Configure your notification preferences for messages, announcements, and alerts.
      </p>
      <div className="mt-8 space-y-4">
        <label className="flex items-center gap-3 rounded-2xl bg-slate-900/70 p-4">
          <input type="checkbox" className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
          <span className="text-slate-200">Email notifications</span>
        </label>
        <label className="flex items-center gap-3 rounded-2xl bg-slate-900/70 p-4">
          <input type="checkbox" className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
          <span className="text-slate-200">In-app notifications</span>
        </label>
        <label className="flex items-center gap-3 rounded-2xl bg-slate-900/70 p-4">
          <input type="checkbox" className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
          <span className="text-slate-200">SMS notifications</span>
        </label>
      </div>
    </div>
  );
};

export default NotificationSettings;
