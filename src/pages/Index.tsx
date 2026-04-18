import { useSimulation } from '@/hooks/use-simulation';
import { OverviewPanel } from '@/components/dashboard/OverviewPanel';
import { TrainList } from '@/components/dashboard/TrainList';
import { TrackVisualization } from '@/components/dashboard/TrackVisualization';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { AIRecommendations } from '@/components/dashboard/AIRecommendations';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { SimulationControls } from '@/components/dashboard/SimulationControls';
import { ScenarioPanel } from '@/components/dashboard/ScenarioPanel';
import { VisionModal } from '@/components/dashboard/VisionModal';
import { SchedulingEngine } from '@/components/dashboard/SchedulingEngine';
import { AIEngine } from '@/components/dashboard/AIEngine';
import { ConflictResolver } from '@/components/dashboard/ConflictResolver';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Train, Cpu, GitBranch, Brain, Shield, CalendarClock } from 'lucide-react';

const Index = () => {
  const { state, history, toggleRunning, setSpeed, reset, runScenario } = useSimulation();
  const m = state.metrics;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan/5 blur-3xl" />
      </div>

      <div className="relative p-3 lg:p-4 space-y-3">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-md border border-primary/20">
              <Train className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-display font-bold tracking-tight leading-none">
                <span className="text-gradient-primary">AI Railway</span> Section Controller
              </h1>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Cpu className="w-3 h-3" /> Enterprise Decision-Support System · Indian Railways Network
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <VisionModal />
            <SimulationControls
              running={state.running} speed={state.speed} tick={state.tick}
              timeOfDay={state.timeOfDay}
              onToggle={toggleRunning} onSpeedChange={setSpeed} onReset={reset}
            />
          </div>
        </header>

        {/* Vision strip */}
        <div className="glass rounded-lg px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-muted-foreground leading-relaxed flex-1 min-w-[300px]">
            <span className="text-foreground font-semibold">Augmenting section controllers</span> with real-time
            AI: predicting delays, detecting conflicts, and recommending optimal routes — keeping humans in command.
          </p>
          <div className="flex items-center gap-3 text-[10px] font-display">
            <span className="flex items-center gap-1 text-primary"><GitBranch className="w-3 h-3" /> A* ROUTING</span>
            <span className="flex items-center gap-1 text-cyan"><Brain className="w-3 h-3" /> EWMA PREDICT</span>
            <span className="flex items-center gap-1 text-accent"><Shield className="w-3 h-3" /> CONFLICT RESOLVE</span>
          </div>
        </div>

        {/* Overview KPIs */}
        <OverviewPanel
          activeTrains={m.activeTrains} delayedTrains={m.delayedTrains}
          onTimePercentage={m.onTimePercentage} efficiency={m.efficiency}
          totalPassengers={m.totalPassengers} avgSpeed={m.avgSpeed}
          safetyScore={m.safetyScore} congestionIndex={m.congestionIndex}
          history={history}
        />

        {/* Main: Map + Trains */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" style={{ minHeight: 380 }}>
          <div className="lg:col-span-2">
            <TrackVisualization stations={state.stations} tracks={state.tracks} trains={state.trains} />
          </div>
          <div>
            <TrainList trains={state.trains} />
          </div>
        </div>

        {/* Engines: Scheduling · AI · Conflict Resolver */}
        <Tabs defaultValue="scheduling" className="w-full">
          <TabsList className="bg-secondary/30 border border-border h-auto p-1">
            <TabsTrigger value="scheduling" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-[11px] font-display uppercase tracking-wider gap-1.5">
              <CalendarClock className="w-3 h-3" /> Scheduling
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-cyan/15 data-[state=active]:text-cyan text-[11px] font-display uppercase tracking-wider gap-1.5">
              <Brain className="w-3 h-3" /> AI Engine
            </TabsTrigger>
            <TabsTrigger value="conflict" className="data-[state=active]:bg-accent/15 data-[state=active]:text-accent text-[11px] font-display uppercase tracking-wider gap-1.5">
              <Shield className="w-3 h-3" /> Conflict Resolver
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scheduling" className="mt-3">
            <SchedulingEngine trains={state.trains} stations={state.stations} tick={state.tick} timeOfDay={state.timeOfDay} />
          </TabsContent>
          <TabsContent value="ai" className="mt-3">
            <AIEngine trains={state.trains} stations={state.stations} tracks={state.tracks} />
          </TabsContent>
          <TabsContent value="conflict" className="mt-3">
            <ConflictResolver trains={state.trains} conflictsResolved={state.metrics.conflictsResolved} />
          </TabsContent>
        </Tabs>

        {/* What-If Scenarios */}
        <ScenarioPanel onRunScenario={runScenario} />

        {/* Alerts + AI Recs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{ minHeight: 280 }}>
          <AlertsPanel alerts={state.alerts} />
          <AIRecommendations recommendations={state.recommendations} />
        </div>

        {/* Performance Charts */}
        <PerformanceCharts history={history} />

        {/* Footer */}
        <div className="text-center text-[9px] text-muted-foreground font-display py-3 border-t border-border/30 leading-relaxed">
          AI-POWERED RAILWAY SECTION CONTROLLER · A* ROUTING · LSTM-INSPIRED DELAY PREDICTION · CONFLICT RESOLUTION · REAL-TIME SIMULATION
          <div className="text-muted-foreground/50 mt-1">Built for the future of intelligent rail operations</div>
        </div>
      </div>
    </div>
  );
};

export default Index;
