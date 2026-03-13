import { Reveal } from '../common/Reveal';
import { GlassCard } from '../common/GlassCard';

export function AboutSection() {
  return (
    <section id="about" className="section">
      <Reveal className="section-header">
        <h2>O projekcie</h2>
        <p>
          Projekt powstał z inicjatywy uczniów, którzy poza lekcjami chcą rozwijać realne
          umiejętności inżynierskie i programistyczne.
        </p>
      </Reveal>
      <div className="grid two-cols">
        <Reveal>
          <GlassCard>
            <h3>Nasze cele</h3>
            <ul className="list">
              <li>Zaplanować, zaprojektować i zbudować rakietę dwustopniową.</li>
              <li>Stworzyć niezawodny komputer pokładowy i system sterowania.</li>
              <li>Bezpiecznie przeprowadzić testy statyczne i lotne.</li>
              <li>Podzielić się wiedzą z innymi uczniami i szkołami.</li>
            </ul>
          </GlassCard>
        </Reveal>
        <Reveal>
          <GlassCard>
            <h3>Czego się uczymy</h3>
            <ul className="list">
              <li>Podstaw aerodynamiki i konstrukcji rakiet.</li>
              <li>Elektroniki: czujniki, zasilanie, komunikacja.</li>
              <li>Programowania systemów wbudowanych i analizy danych.</li>
              <li>Planowania projektu, pracy w zespole i bezpieczeństwa.</li>
            </ul>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

