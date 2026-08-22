export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  );
}

/**
 * Minimal weekly bar chart built with plain divs — no charting library needed.
 * data: [{ label: 'Mon', value: 1, color: 'bg-flow-500' }, ...]
 */
export function BarChart({ data, max = 1 }) {
  return (
    <div className="flex items-end gap-3 h-32">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full h-24 flex items-end">
            <div
              className={`w-full rounded-t-md ${d.color} transition-all duration-500`}
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 12 : 3)}%` }}
            />
          </div>
          <span className="text-xs text-slate">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
