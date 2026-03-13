import { Reveal } from '../common/Reveal';
import { GlassCard } from '../common/GlassCard';
import { Metric } from '../common/Metric';
import { Progress } from '../common/Progress';

export function DashboardSection({ telemetry }) {
  return (
    <section id="dashboard" className="section">
      <Reveal className="section-header">
        <h2>Telemetry Dashboard (demo)</h2>
        <p>
          Podgląd przykładowej telemetrii – animowana wizualizacja danych (wysokość, prędkość,
          przyspieszenie, zasilanie, sygnał). To jest demo UI, nie realny odczyt z rakiety.
        </p>
      </Reveal>

      <div className="grid two-cols">
        <Reveal>
          <GlassCard className="panel">
            <div className="panel-header">
              <h3>Lot</h3>
              <span className="chip glass-pill">Stage {telemetry.stage}</span>
              <span className="chip glass-pill">{telemetry.mode}</span>
            </div>
            <div className="grid two-cols panel-metrics">
              <Metric label="Wysokość" value={`${Math.round(telemetry.alt)} m`} hint="ALT" />
              <Metric label="Prędkość" value={`${Math.round(telemetry.vel)} m/s`} hint="VEL" />
              <Metric label="Przyspieszenie" value={`${telemetry.acc.toFixed(1)} m/s²`} hint="ACC" />
              <Metric label="Sygnał" value={`${Math.round(telemetry.signal)}%`} hint="LINK" />
            </div>
          </GlassCard>
        </Reveal>

        <Reveal>
          <GlassCard className="panel">
            <div className="panel-header">
              <h3>Status systemów</h3>
              <span className="chip glass-pill ok">OK</span>
            </div>
            <Progress label="Bateria" value={telemetry.batt} max={100} suffix="%" />
            <Progress label="Sygnał" value={telemetry.signal} max={100} suffix="%" />
            <Progress label="Separacja stopni (test)" value={telemetry.stage === 2 ? 100 : 35} />
            <div className="panel-foot">
              <span className="mono">tick: 500ms</span>
              <span className="mono">log: enabled</span>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

