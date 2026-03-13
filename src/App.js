import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { Root } from './components/root/root';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';

  const saved = window.localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;

  return window.matchMedia?.('(prefers-color-scheme: light)')?.matches ? 'light' : 'dark';
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [navOpen, setNavOpen] = useState(false);
  const nextThemeLabel = useMemo(() => (theme === 'dark' ? 'Jasny' : 'Ciemny'), [theme]);
  const [telemetry, setTelemetry] = useState(() => ({
    alt: 0,
    vel: 0,
    acc: 0,
    batt: 97,
    signal: 92,
    stage: 1,
    mode: 'SAFE',
  }));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const tick = () => {
      const t = Date.now() / 1000;
      setTelemetry((prev) => {
        const stage = prev.stage;
        const stage2 = t % 30 > 18 ? 2 : 1;
        const altBase = stage2 === 2 ? 720 : 320;
        const velBase = stage2 === 2 ? 185 : 120;
        const wobble = (amp, spd) => amp * Math.sin(t * spd);

        return {
          alt: Math.max(0, altBase + wobble(75, 0.55) + wobble(32, 1.2)),
          vel: Math.max(0, velBase + wobble(22, 0.9) + wobble(9, 2.2)),
          acc: Math.max(0, 14 + wobble(6, 1.35) + wobble(3.5, 2.6)),
          batt: Math.max(55, Math.min(100, prev.batt - 0.02 + wobble(0.2, 0.45))),
          signal: Math.max(40, Math.min(100, 86 + wobble(10, 0.38) + wobble(3, 1.9))),
          stage: stage2,
          mode: stage2 === 2 ? 'ASCENT' : 'BOOST',
        };
      });
    };

    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, []);

  const faqItems = useMemo(
    () => [
      {
        id: 'faq-1',
        q: 'Czy trzeba mieć doświadczenie, żeby dołączyć?',
        a: (
          <p>
            Nie. Dzielimy zadania na mniejsze kawałki, uczymy się razem i prowadzimy dokumentację.
            Najważniejsze są chęci, regularność i bezpieczeństwo.
          </p>
        ),
      },
      {
        id: 'faq-2',
        q: 'Nad czym pracuje komputer pokładowy?',
        a: (
          <p>
            Zbiera dane z czujników (np. IMU/GPS), zapisuje logi i wspiera decyzje w locie (np.
            sekwencje etapów testowych). Na stronie pokazujemy tylko przykładową telemetrię – demo.
          </p>
        ),
      },
      {
        id: 'faq-3',
        q: 'Jak wygląda praca zespołowa?',
        a: (
          <p>
            Ustalamy cele na tydzień/dwa, robimy krótkie podsumowania i pilnujemy checklist.
            Mechanika, elektronika i software działają równolegle, ale synchronizujemy interfejsy.
          </p>
        ),
      },
      {
        id: 'faq-4',
        q: 'Czy można wesprzeć projekt?',
        a: (
          <p>
            Tak – sprzętem, miejscem do testów, wiedzą albo finansowo. W sekcji kontaktowej możesz
            zostawić wiadomość i dopniemy szczegóły.
          </p>
        ),
      },
    ],
    [],
  );

  return (
    <Root
      theme={theme}
      setTheme={setTheme}
      nextThemeLabel={nextThemeLabel}
      navOpen={navOpen}
      setNavOpen={setNavOpen}
      telemetry={telemetry}
      faqItems={faqItems}
    />
  );
}

export default App;
