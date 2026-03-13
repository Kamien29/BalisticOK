export function Metric({ label, value, hint }) {
  return (
    <div className="metric glass">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}</span>
      </div>
      {hint ? <div className="metric-hint">{hint}</div> : null}
    </div>
  );
}

