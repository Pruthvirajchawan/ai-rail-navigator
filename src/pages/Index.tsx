import { useSimulation } from '@/hooks/use-simulation';
import { OverviewPanel } from '@/components/dashboard/OverviewPanel';
import { TrainList } from '@/components/dashboard/TrainList';
import { TrackVisualization } from '@/components/dashboard/TrackVisualization';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { AIRecommendations } from '@/components/dashboard/AIRecommendations';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { SimulationControls } from '@/components/dashboard/SimulationControls';
import { ScenarioPanel } from '@/components/dashboard/ScenarioPanel';
import { Train, Cpu } from 'lucide-react';

const Index = () => {
  const { state, history, toggleRunning, setSpeed, reset, runScenario } = useSimulation();
  const m = state.metrics;

  return (
    <div className="min-h-screen bg-background p-3 lg:p-4 space-y-3">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center glow-md">
            <Train className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base lg:text-lg font-display font-bold tracking-tight leading-none">
              <span className="text-gradient-primary">AI Railway</span> Section Controller
            </h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Cpu className="w-3 h-3" /> Enterprise Real-Time Management System · Indian Railways Network
            </p>
          </div>
        </div>
        <SimulationControls
          running={state.running} speed={state.speed} tick={state.tick}
          timeOfDay={state.timeOfDay}
          onToggle={toggleRunning} onSpeedChange={setSpeed} onReset={reset}
        />
      </header>

      {/* Overview KPIs */}
      <OverviewPanel
        activeTrains={m.activeTrains} delayedTrains={m.delayedTrains}
        onTimePercentage={m.onTimePercentage} efficiency={m.efficiency}
        totalPassengers={m.totalPassengers} avgSpeed={m.avgSpeed}
        safetyScore={m.safetyScore} congestionIndex={m.congestionIndex}
      />

      {/* Main: Map + Trains */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" style={{ minHeight: 360 }}>
        <div className="lg:col-span-2">
          <TrackVisualization stations={state.stations} tracks={state.tracks} trains={state.trains} />
        </div>
        <div>
          <TrainList trains={state.trains} />
        </div>
      </div>

      {/* What-If Scenarios */}
      <ScenarioPanel onRunScenario={runScenario} />

      {/* Alerts + AI Recs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{ minHeight: 240 }}>
        <AlertsPanel alerts={state.alerts} />
        <AIRecommendations recommendations={state.recommendations} />
      </div>

      {/* Performance Charts */}
      <PerformanceCharts history={history} />

      {/* Footer */}
      <div className="text-center text-[9px] text-muted-foreground font-display py-2 border-t border-border/30">
        AI-POWERED RAILWAY SECTION CONTROLLER · A* ROUTING · LSTM DELAY PREDICTION · CONFLICT RESOLUTION · REAL-TIME SIMULATION
      </div>
    </div>
  );
};

export default Index;
