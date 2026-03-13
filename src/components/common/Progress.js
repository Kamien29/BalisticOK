export function Progress({ label, value, max = 100, suffix = '%' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="progress">
      <div className="progress-row">
        <span className="progress-label">{label}</span>
        <span className="progress-value">
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <div className="progress-track glass">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

