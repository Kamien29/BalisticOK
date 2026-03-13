import { Reveal } from '../common/Reveal';
import { GlassCard } from '../common/GlassCard';

export function TeamSection() {
  return (
    <section id="team" className="section">
      <Reveal className="section-header">
        <h2>Zespół uczniów</h2>
        <p>
          W projekcie biorą udział uczniowie z różnych szkół – każdy może znaleźć dla siebie rolę,
          niezależnie od poziomu doświadczenia.
        </p>
      </Reveal>
      <div className="grid three-cols">
        <Reveal>
          <GlassCard>
            <h3>Mechanika i konstrukcja</h3>
            <div className="section-image-placeholder">
              <span>miejsce na grafikę zespołu mechaniki</span>
            </div>
            <p>Projektowanie kadłuba, mocowań, systemu separacji oraz spadochronu.</p>
          </GlassCard>
        </Reveal>
        <Reveal>
          <GlassCard>
            <h3>Elektronika i programowanie</h3>
            <div className="section-image-placeholder">
              <span>miejsce na grafikę zespołu elektroniki</span>
            </div>
            <p>Komputer pokładowy, czujniki, zasilanie, oprogramowanie i telemetria.</p>
          </GlassCard>
        </Reveal>
        <Reveal>
          <GlassCard>
            <h3>Organizacja i komunikacja</h3>
            <div className="section-image-placeholder">
              <span>miejsce na grafikę zespołu organizacji</span>
            </div>
            <p>Planowanie, dokumentacja, media społecznościowe, kontakty ze szkołami.</p>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

