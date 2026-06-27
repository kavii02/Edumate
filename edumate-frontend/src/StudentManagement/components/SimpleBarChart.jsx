export default function SimpleBarChart({ data, labelKey = 'label', valueKey = 'value', color = 'from-cyan-500 to-cyan-400', unit = '' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1)

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item[labelKey]}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 truncate pr-2">{item[labelKey]}</span>
            <span className="text-slate-200 font-semibold shrink-0">{item[valueKey]}{unit}</span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
              style={{ width: `${(item[valueKey] / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
