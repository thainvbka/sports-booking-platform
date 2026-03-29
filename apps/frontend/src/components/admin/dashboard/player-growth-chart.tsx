import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { RetentionPoint } from "@/types/admin.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlayerGrowthChartProps {
  data: RetentionPoint[];
}

export function PlayerGrowthChart({ data }: PlayerGrowthChartProps) {
  const lastRetention = data[data.length - 1];
  const retentionPct = lastRetention
    ? Math.round((lastRetention.returning / (lastRetention.returning + lastRetention.new)) * 100)
    : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-4 px-6">
        <CardTitle className="text-lg">User Growth</CardTitle>
        <CardDescription className="text-[11px]">New vs Returning players</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="h-[160px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={12} margin={{ left: -30, bottom: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/20" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  fontSize: '10px' 
                }} 
              />
              <Legend verticalAlign="top" align="right" iconType="circle" iconSize={5} wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingBottom: '10px' }} />
              <Bar dataKey="returning" name="Returning" stackId="a" fill="hsl(var(--primary))" />
              <Bar dataKey="new" name="New" stackId="a" fill="hsl(var(--primary) / 0.2)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-[10px] font-black text-primary uppercase tracking-tighter mb-0.5">Retention</p>
          <p className="text-xs font-bold leading-tight">{retentionPct}% returning rate</p>
        </div>
      </CardContent>
    </Card>
  );
}
