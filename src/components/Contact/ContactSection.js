import { Reveal } from '../common/Reveal';
import { GlassCard } from '../common/GlassCard';

export function ContactSection() {
  return (
    <section id="contact" className="section">
      <Reveal className="section-header">
        <h2>Kontakt / dołącz do nas</h2>
        <p>
          Jeżeli jesteś uczniem, nauczycielem lub po prostu pasjonatem tematu – odezwij się. Chętnie
          współpracujemy z nowymi osobami i szkołami.
        </p>
      </Reveal>
      <div className="grid two-cols">
        <Reveal>
          <GlassCard>
            <h3>Jak możesz pomóc</h3>
            <ul className="list">
              <li>Dołączając do zespołu technicznego lub organizacyjnego.</li>
              <li>Udostępniając miejsce do testów i startu.</li>
              <li>Wspierając nas wiedzą, sprzętem lub finansowo.</li>
            </ul>
          </GlassCard>
        </Reveal>
        <Reveal>
          <GlassCard className="contact-card">
            <h3>Napisz do nas</h3>
            <p>
              Możesz wysłać maila na adres{' '}
              <a href="mailto:rakieta.projekt@szkola.pl">rakieta.projekt@szkola.pl</a>{' '}
              lub skontaktować się z opiekunem projektu w swojej szkole.
            </p>
            <p className="note">
              Tutaj możesz później podpiąć prawdziwy formularz kontaktowy albo link do profilu w
              mediach społecznościowych.
            </p>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

