import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PerformanceChartsProps {
  history: { tick: number; onTime: number; avgDelay: number; efficiency: number }[];
}

export function PerformanceCharts({ history }: PerformanceChartsProps) {
  if (history.length < 2) {
    return (
      <div className="glass-panel rounded-lg p-6 text-center text-muted-foreground text-sm">
        Collecting performance data...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="glass-panel rounded-lg p-4">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">On-Time % & Efficiency</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
            <XAxis dataKey="tick" stroke="hsl(215 12% 50%)" fontSize={10} />
            <YAxis stroke="hsl(215 12% 50%)" fontSize={10} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 14% 18%)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'hsl(210 20% 80%)' }}
            />
            <Line type="monotone" dataKey="onTime" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={false} name="On-Time %" />
            <Line type="monotone" dataKey="efficiency" stroke="hsl(210 100% 56%)" strokeWidth={2} dot={false} name="Efficiency %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-panel rounded-lg p-4">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">Average Delay (min)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={history.slice(-15)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
            <XAxis dataKey="tick" stroke="hsl(215 12% 50%)" fontSize={10} />
            <YAxis stroke="hsl(215 12% 50%)" fontSize={10} />
            <Tooltip
              contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 14% 18%)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'hsl(210 20% 80%)' }}
            />
            <Bar dataKey="avgDelay" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} name="Avg Delay" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
