const HelpSupport = () => {
  return (
    <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-8 shadow-[0_0_25px_rgba(34,211,238,0.45)]">
      <h1 className="text-3xl font-bold text-white">Help & Support</h1>
      <p className="mt-4 text-slate-300">
        Find answers, contact support, or access helpful resources for your tutoring account.
      </p>
      <div className="mt-8 space-y-4 text-slate-300">
        <p>Need assistance? Email support at <span className="text-cyan-300">support@edumate.com</span>.</p>
        <p>Check our FAQ for common questions about scheduling, payments, and course creation.</p>
        <button className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
          Open FAQ
        </button>
      </div>
    </div>
  );
};

export default HelpSupport;
