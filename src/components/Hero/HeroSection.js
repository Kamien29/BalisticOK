export function HeroSection({ theme, setTheme, nextThemeLabel, navOpen, setNavOpen }) {
  return (
    <header className="hero">
      <nav className={`nav ${navOpen ? 'nav-open' : ''}`.trim()}>
        <div className="logo">BalisticOK</div>
        <div className="nav-right">
          <button
            type="button"
            className="nav-toggle"
            aria-label={navOpen ? 'Zamknij menu nawigacji' : 'Otwórz menu nawigacji'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
          <div className="nav-links">
            <a href="#about" onClick={() => setNavOpen(false)}>
              O projekcie
            </a>
            <a href="#rocket" onClick={() => setNavOpen(false)}>
              Rakieta
            </a>
            <a href="#dashboard" onClick={() => setNavOpen(false)}>
              Dashboard
            </a>
            <a href="#team" onClick={() => setNavOpen(false)}>
              Zespół
            </a>
            <a href="#logbook" onClick={() => setNavOpen(false)}>
              Logbook
            </a>
            <a href="#faq" onClick={() => setNavOpen(false)}>
              FAQ
            </a>
            <a href="#timeline" onClick={() => setNavOpen(false)}>
              Harmonogram
            </a>
            <a href="#contact" onClick={() => setNavOpen(false)}>
              Kontakt
            </a>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={`Przełącz na ${nextThemeLabel.toLowerCase()} motyw`}
            title={`Przełącz na ${nextThemeLabel.toLowerCase()} motyw`}
          >
            <span className="theme-toggle-dot" aria-hidden="true" />
            <span className="theme-toggle-label">
              Motyw: {theme === 'dark' ? 'Ciemny' : 'Jasny'}
            </span>
          </button>
        </div>
      </nav>
      <div className="hero-content">
        <div className="hero-text">
          <h1>
            Dwustopniowa rakieta
            <span> na paliwo stałe</span>
          </h1>
          <p>
            Jesteśmy grupą uczniów z różnych szkół, których łączy jedno – fascynacja kosmosem i
            inżynierią rakietową. W wolnym czasie projektujemy i budujemy dwustopniową rakietę z
            komputerem pokładowym.
          </p>
          <div className="hero-cta">
            <a href="#contact" className="btn primary">
              Dołącz / skontaktuj się
            </a>
            <a href="#rocket" className="btn secondary">
              Zobacz naszą rakietę
            </a>
          </div>
        </div>
        <div className="hero-card glass">
          <div className="badge glass-pill">Amatorska inżynieria • STEM</div>
          <div className="stats">
            <div className="stat glass">
              <span className="stat-number">2</span>
              <span className="stat-label">stopnie rakiety</span>
            </div>
            <div className="stat glass">
              <span className="stat-number">12+</span>
              <span className="stat-label">uczestników</span>
            </div>
            <div className="stat glass">
              <span className="stat-number">2026</span>
              <span className="stat-label">planowany start</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

