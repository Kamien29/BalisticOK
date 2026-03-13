import { Reveal } from '../common/Reveal';
import { GlassCard } from '../common/GlassCard';

export function LogbookSection() {
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
            <h3>Galeria (placeholder)</h3>
            <div className="gallery">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="gallery-tile glass">
                  <div className="gallery-caption">Zdjęcie #{i + 1}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

