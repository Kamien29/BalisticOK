import { Reveal } from '../common/Reveal';

export function TimelineSection() {
  return (
    <section id="timeline" className="section section-alt">
      <Reveal className="section-header">
        <h2>Harmonogram prac</h2>
        <p>Pracujemy krok po kroku – od prototypów po pełny lot rakiety.</p>
      </Reveal>
      <div className="timeline">
        <Reveal>
          <div className="timeline-item glass">
            <span className="timeline-date glass-pill">Etap 1</span>
            <h3>Projekt koncepcyjny</h3>
            <p>Określenie wymagań, wstępne obliczenia, pierwsze szkice rakiety.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="timeline-item glass">
            <span className="timeline-date glass-pill">Etap 2</span>
            <h3>Prototypy i testy naziemne</h3>
            <p>Budowa modeli testowych, sprawdzenie działania elektroniki i silników.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="timeline-item glass">
            <span className="timeline-date glass-pill">Etap 3</span>
            <h3>Pełna rakieta i start</h3>
            <p>Składanie rakiety, procedury bezpieczeństwa i przeprowadzenie startu.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

