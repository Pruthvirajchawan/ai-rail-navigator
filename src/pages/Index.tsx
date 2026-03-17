import { useSimulation } from '@/hooks/use-simulation';
import { OverviewPanel } from '@/components/dashboard/OverviewPanel';
import { TrainList } from '@/components/dashboard/TrainList';
import { TrackVisualization } from '@/components/dashboard/TrackVisualization';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { AIRecommendations } from '@/components/dashboard/AIRecommendations';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { SimulationControls } from '@/components/dashboard/SimulationControls';
import { Train, Cpu } from 'lucide-react';

const Index = () => {
  const { state, history, toggleRunning, setSpeed, reset } = useSimulation();

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
            <Train className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight">Railway Section Controller</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Cpu className="w-3 h-3" /> AI-Powered Real-Time Management
            </p>
          </div>
        </div>
        <SimulationControls
          running={state.running}
          speed={state.speed}
          tick={state.tick}
          onToggle={toggleRunning}
          onSpeedChange={setSpeed}
          onReset={reset}
        />
      </header>

      {/* Overview */}
      <OverviewPanel
        activeTrains={state.metrics.activeTrains}
        delayedTrains={state.metrics.delayedTrains}
        onTimePercentage={state.metrics.onTimePercentage}
        efficiency={state.metrics.efficiency}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
        <div className="lg:col-span-2">
          <TrackVisualization stations={state.stations} tracks={state.tracks} trains={state.trains} />
        </div>
        <div>
          <TrainList trains={state.trains} />
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
        <AlertsPanel alerts={state.alerts} />
        <AIRecommendations recommendations={state.recommendations} />
      </div>

      {/* Charts */}
      <div className="mt-4">
        <PerformanceCharts history={history} />
      </div>
    </div>
  );
};

export default Index;
