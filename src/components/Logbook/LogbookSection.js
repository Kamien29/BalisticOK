import { useState } from 'react';
import { Reveal } from '../common/Reveal';
import { GlassCard } from '../common/GlassCard';
import { ImageLightbox } from '../Gallery/ImageLightbox';
import { useMedia } from '../Media/MediaContext';

export function LogbookSection() {
  const { media, loading, error } = useMedia();
  const images = media.gallery;
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <section id="logbook" className="section section-alt">
      <Reveal className="section-header">
        <h2>Logbook</h2>
        <p>
          Krótki dziennik postępów – co robimy, co przetestowaliśmy i co planujemy dalej. Możesz tu
          później podpiąć prawdziwe wpisy (np. z GitHuba).
        </p>
      </Reveal>
      <div className="grid two-cols">
        <Reveal>
          <GlassCard>
            <h3>Ostatnie wpisy</h3>
            <div className="log-list">
              <div className="log-item">
                <span className="log-dot" />
                <div>
                  <div className="log-title">Prototyp telemetrii</div>
                  <div className="log-meta">UI • logowanie danych • 2 dni temu</div>
                </div>
              </div>
              <div className="log-item">
                <span className="log-dot" />
                <div>
                  <div className="log-title">Testy elektroniki na stole</div>
                  <div className="log-meta">czujniki • zasilanie • tydzień temu</div>
                </div>
              </div>
              <div className="log-item">
                <span className="log-dot" />
                <div>
                  <div className="log-title">Koncepcja separacji stopni</div>
                  <div className="log-meta">mechanika • bezpieczeństwo • 2 tygodnie temu</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
        <Reveal>
          <GlassCard>
            <h3>Galeria</h3>
            {loading && <p>Wczytywanie zdjęć…</p>}
            {error && <p role="alert">{error}</p>}
            {!loading && images.length === 0 && <p>Brak zdjęć. Dodaj je w panelu administratora.</p>}
            <div className="gallery">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  className="gallery-tile glass gallery-tile-btn"
                  onClick={() => {
                    setLightboxIndex(i);
                    setLightboxOpen(true);
                  }}
                  aria-label={`Otwórz zdjęcie ${i + 1}`}
                >
                  <img className="gallery-thumb" src={img.src} alt={img.alt ?? ''} loading="lazy" />
                  <div className="gallery-caption">{img.alt}</div>
                </button>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </div>

      <ImageLightbox
        open={lightboxOpen && images.length > 0}
        images={images}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
}

