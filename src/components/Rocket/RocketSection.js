import { SectionImage } from '../Media/SectionImage';
import { Reveal } from '../common/Reveal';
import { GlassCard } from '../common/GlassCard';

export function RocketSection() {
  return (
    <section id="rocket" className="section section-alt">
      <Reveal className="section-header">
        <h2>Dwustopniowa rakieta</h2>
        <p>
          Rakieta została zaprojektowana jako dwustopniowa konstrukcja na paliwo stałe, z komputerem
          pokładowym kontrolującym lot i zbierającym dane.
        </p>
      </Reveal>
      <div className="grid three-cols">
        <Reveal>
          <GlassCard>
            <h3>Stopień I – start</h3>
            <SectionImage slot="rocket-1" placeholder="miejsce na grafikę stopnia I" />
            <p>
              Główny silnik na paliwo stałe zapewniający ciąg potrzebny do wyniesienia rakiety na
              odpowiednią wysokość. Konstrukcja skupiona na bezpieczeństwie i stabilności lotu.
            </p>
          </GlassCard>
        </Reveal>
        <Reveal>
          <GlassCard>
            <h3>Stopień II – wznoszenie</h3>
            <SectionImage slot="rocket-2" placeholder="miejsce na grafikę stopnia II" />
            <p>
              Drugi stopień odpowiada za dalsze wynoszenie rakiety oraz stabilizację trajektorii.
              Separacja stopni jest sterowana elektronicznie.
            </p>
          </GlassCard>
        </Reveal>
        <Reveal>
          <GlassCard>
            <h3>Komputer pokładowy</h3>
            <SectionImage slot="rocket-computer" placeholder="miejsce na grafikę komputera" />
            <p>
              Moduł z mikrokontrolerem, akcelerometrem, żyroskopem, GPS oraz rejestratorem danych.
              Odpowiada za pomiary, decyzje sterujące i późniejszą analizę lotu.
            </p>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

