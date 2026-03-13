import React from 'react';
import { HeroSection } from '../Hero/HeroSection';
import { AboutSection } from '../About/AboutSection';
import { RocketSection } from '../Rocket/RocketSection';
import { DashboardSection } from '../Dashboard/DashboardSection';
import { TeamSection } from '../Team/TeamSection';
import { LogbookSection } from '../Logbook/LogbookSection';
import { FAQSection } from '../FAQ/FAQSection';
import { TimelineSection } from '../Timeline/TimelineSection';
import { ContactSection } from '../Contact/ContactSection';

export function Root({
  theme,
  setTheme,
  nextThemeLabel,
  navOpen,
  setNavOpen,
  telemetry,
  faqItems,
}) {
  return (
    <div className="app">
      <div className="bg-blobs" aria-hidden="true">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
      </div>

      <HeroSection
        theme={theme}
        setTheme={setTheme}
        nextThemeLabel={nextThemeLabel}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
      />

      <main>
        <AboutSection />
        <RocketSection />
        <DashboardSection telemetry={telemetry} />
        <TeamSection />
        <LogbookSection />
        <FAQSection items={faqItems} />
        <TimelineSection />
        <ContactSection />
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Projekt Rakieta – zespół uczniów.</p>
      </footer>
    </div>
  );
}