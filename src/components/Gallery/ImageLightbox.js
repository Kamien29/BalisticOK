import { useEffect, useMemo, useRef, useState } from 'react';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function ImageLightbox({ open, images, index, onIndexChange, onClose }) {
  const count = images?.length ?? 0;
  const safeIndex = clamp(index ?? 0, 0, Math.max(0, count - 1));

  const [phase, setPhase] = useState(open ? 'open' : 'closed'); // 'opening' | 'open' | 'closing' | 'closed'
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const backdropRef = useRef(null);
  const dragStartRef = useRef(null);
  const lastMoveRef = useRef(null);

  const current = images?.[safeIndex] ?? null;
  const prev = images?.[safeIndex - 1] ?? null;
  const next = images?.[safeIndex + 1] ?? null;

  const canPrev = safeIndex > 0;
  const canNext = safeIndex < count - 1;

  const dragThresholdPx = 64;
  const closeThresholdY = 90;

  const slides = useMemo(() => {
    // Keep a stable 3-slide window for smooth transitions.
    return [
      { key: `prev-${safeIndex - 1}`, item: prev, pos: -1, visible: !!prev },
      { key: `cur-${safeIndex}`, item: current, pos: 0, visible: !!current },
      { key: `next-${safeIndex + 1}`, item: next, pos: 1, visible: !!next },
    ];
  }, [current, next, prev, safeIndex]);

  useEffect(() => {
    if (open) setPhase((p) => (p === 'closed' ? 'opening' : p));
    if (!open) setPhase((p) => (p === 'open' ? 'closing' : 'closed'));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft' && canPrev) onIndexChange?.(safeIndex - 1);
      if (e.key === 'ArrowRight' && canNext) onIndexChange?.(safeIndex + 1);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [canNext, canPrev, onClose, onIndexChange, open, safeIndex]);

  useEffect(() => {
    if (phase === 'opening') {
      const id = window.setTimeout(() => setPhase('open'), 30);
      return () => window.clearTimeout(id);
    }
    if (phase === 'closing') {
      const id = window.setTimeout(() => setPhase('closed'), 260);
      return () => window.clearTimeout(id);
    }
  }, [phase]);

  const requestClose = () => {
    if (phase === 'closing' || phase === 'closed') return;
    setPhase('closing');
    onClose?.();
  };

  const goPrev = () => {
    if (!canPrev) return;
    onIndexChange?.(safeIndex - 1);
  };

  const goNext = () => {
    if (!canNext) return;
    onIndexChange?.(safeIndex + 1);
  };

  const onBackdropMouseDown = (e) => {
    // Close only when clicking outside the panel area.
    if (e.target === backdropRef.current) requestClose();
  };

  const onPointerDown = (e) => {
    if (!open || !current) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    dragStartRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    setDragging(true);
    setDragX(0);
    setDragY(0);

    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging || !dragStartRef.current) return;
    const rawDx = e.clientX - dragStartRef.current.x;
    const rawDy = e.clientY - dragStartRef.current.y;

    // Rubber-band effect at edges (iOS-like).
    const dx =
      (!canPrev && rawDx > 0) || (!canNext && rawDx < 0) ? rawDx * 0.35 : rawDx;

    // Prefer vertical drag when it's clearly dominant (for close gesture).
    const verticalDominant = Math.abs(rawDy) > Math.abs(rawDx) * 1.2;
    setDragX(verticalDominant ? 0 : dx);
    setDragY(verticalDominant ? rawDy : 0);
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);

    const dx = dragX;
    const dy = dragY;
    const lm = lastMoveRef.current;
    const start = dragStartRef.current;
    dragStartRef.current = null;
    lastMoveRef.current = null;

    const dt = lm && start ? Math.max(1, lm.t - start.t) : 1;
    const vx = dx / dt; // px/ms
    const vy = dy / dt; // px/ms

    const shouldGoNext = (dx < -dragThresholdPx && canNext) || (vx < -0.6 && canNext);
    const shouldGoPrev = (dx > dragThresholdPx && canPrev) || (vx > 0.6 && canPrev);
    const shouldClose = dy > closeThresholdY || vy > 0.9;

    if (shouldClose) requestClose();
    if (shouldGoNext) goNext();
    if (shouldGoPrev) goPrev();

    setDragX(0);
    setDragY(0);
  };

  if (phase === 'closed') return null;

  return (
    <div
      ref={backdropRef}
      className={[
        'lightbox-backdrop',
        phase === 'opening' ? 'is-opening' : '',
        phase === 'open' ? 'is-open' : '',
        phase === 'closing' ? 'is-closing' : '',
      ].join(' ')}
      onMouseDown={onBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-label="Przeglądarka zdjęć"
    >
      <div className="lightbox-topbar glass">
        <div className="lightbox-title">
          <div className="lightbox-kicker">Galeria</div>
          <div className="lightbox-count">
            {count ? `${safeIndex + 1} / ${count}` : '—'}
          </div>
        </div>
        <button className="lightbox-close" type="button" onClick={requestClose} aria-label="Zamknij">
          ✕
        </button>
      </div>

      <div
        className="lightbox-panel glass"
        style={{
          transform: dragY ? `translate3d(0, ${Math.min(180, dragY)}px, 0) scale(${1 - Math.min(0.06, Math.abs(dragY) / 2600)})` : undefined,
          transition: dragging ? 'none' : undefined,
        }}
      >
        <button
          className={['lightbox-nav', 'left', !canPrev ? 'disabled' : ''].join(' ')}
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Poprzednie zdjęcie"
        >
          ‹
        </button>

        <div
          className={['lightbox-viewport', dragging ? 'is-dragging' : ''].join(' ')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="lightbox-track"
            style={{
              transform: `translate3d(calc(${dragX}px - 100%), 0, 0)`,
            }}
          >
            {slides.map((s) => (
              <div
                key={s.key}
                className={['lightbox-slide', s.visible ? '' : 'is-empty'].join(' ')}
                aria-hidden={!s.visible}
              >
                {s.item ? (
                  <img
                    className="lightbox-image"
                    src={s.item.src}
                    alt={s.item.alt ?? ''}
                    draggable={false}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <button
          className={['lightbox-nav', 'right', !canNext ? 'disabled' : ''].join(' ')}
          type="button"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Następne zdjęcie"
        >
          ›
        </button>
      </div>

      <div className="lightbox-hint">
        <span className="glass-pill chip">Swipe</span>
        <span className="glass-pill chip">← / →</span>
        <span className="glass-pill chip">ESC</span>
      </div>
    </div>
  );
}

