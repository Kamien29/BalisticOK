import { useState } from 'react';

export function Accordion({ items }) {
  const [openId, setOpenId] = useState(items?.[0]?.id ?? null);
  return (
    <div className="accordion">
      {items.map((it) => {
        const open = it.id === openId;
        return (
          <div key={it.id} className={`accordion-item glass ${open ? 'open' : ''}`.trim()}>
            <button
              type="button"
              className="accordion-trigger"
              onClick={() => setOpenId((prev) => (prev === it.id ? null : it.id))}
              aria-expanded={open}
            >
              <span>{it.q}</span>
              <span className="accordion-icon" aria-hidden="true">
                {open ? '−' : '+'}
              </span>
            </button>
            <div className="accordion-panel" role="region">
              <div className="accordion-panel-inner">{it.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

