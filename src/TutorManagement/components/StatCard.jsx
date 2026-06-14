const StatCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#061527]/90 p-6 shadow-[0_0_18px_rgba(34,211,238,0.12)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400">{title}</p>
          <h3 className="mt-3 text-4xl font-bold text-blue-400">{value}</h3>
        </div>

        <div className="rounded-lg bg-emerald-400/20 p-2 text-emerald-300">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;