import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface PerformanceChartsProps {
  history: { tick: number; onTime: number; avgDelay: number; efficiency: number; throughput: number; congestion: number }[];
}

const tooltipStyle = {
  contentStyle: { background: 'hsl(222 22% 9%)', border: '1px solid hsl(222 16% 15%)', borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono' },
  labelStyle: { color: 'hsl(210 20% 78%)' },
};

export function PerformanceCharts({ history }: PerformanceChartsProps) {
  if (history.length < 3) {
    return (
      <div className="glass rounded-lg p-8 text-center text-muted-foreground text-sm animate-pulse-glow">
        <div className="font-display text-xs uppercase tracking-wider mb-1">Collecting Data</div>
        Aggregating performance metrics...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
      {/* On-Time & Efficiency */}
      <div className="glass rounded-lg p-3">
        <h3 className="font-display text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Punctuality & Efficiency</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="gradOnTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 76%, 44%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152, 76%, 44%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEff" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 16%, 15%)" />
            <XAxis dataKey="tick" stroke="hsl(215, 14%, 48%)" fontSize={9} fontFamily="JetBrains Mono" />
            <YAxis stroke="hsl(215, 14%, 48%)" fontSize={9} domain={[0, 100]} fontFamily="JetBrains Mono" />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="onTime" stroke="hsl(152, 76%, 44%)" strokeWidth={1.5} fill="url(#gradOnTime)" name="On-Time %" />
            <Area type="monotone" dataKey="efficiency" stroke="hsl(187, 80%, 48%)" strokeWidth={1.5} fill="url(#gradEff)" name="Efficiency %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Average Delay */}
      <div className="glass rounded-lg p-3">
        <h3 className="font-display text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Average Delay (min)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={history.slice(-20)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 16%, 15%)" />
            <XAxis dataKey="tick" stroke="hsl(215, 14%, 48%)" fontSize={9} fontFamily="JetBrains Mono" />
            <YAxis stroke="hsl(215, 14%, 48%)" fontSize={9} fontFamily="JetBrains Mono" />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="avgDelay" fill="hsl(40, 95%, 54%)" radius={[3, 3, 0, 0]} name="Avg Delay" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Congestion & Throughput */}
      <div className="glass rounded-lg p-3">
        <h3 className="font-display text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Congestion & Throughput</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 16%, 15%)" />
            <XAxis dataKey="tick" stroke="hsl(215, 14%, 48%)" fontSize={9} fontFamily="JetBrains Mono" />
            <YAxis stroke="hsl(215, 14%, 48%)" fontSize={9} fontFamily="JetBrains Mono" />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="congestion" stroke="hsl(0, 76%, 54%)" strokeWidth={1.5} dot={false} name="Congestion %" />
            <Line type="monotone" dataKey="throughput" stroke="hsl(217, 100%, 62%)" strokeWidth={1.5} dot={false} name="Throughput" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
