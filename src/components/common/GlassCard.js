export function GlassCard({ as: Tag = 'div', className = '', children }) {
  return (
    <Tag className={`card glass tilt ${className}`.trim()}>
      <div className="glass-inner">{children}</div>
    </Tag>
  );
}

