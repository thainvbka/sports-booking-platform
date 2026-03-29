import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { RevenueTrendPoint } from "@/types/admin.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const fmtM = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);
const fmtVND = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)} ₫`;
const fmtPct = (n: number) => `${Number(n).toFixed(1)}%`;

const DarkTip = ({ active, payload, label, fmt }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-lg p-3 text-[10px] min-w-[140px] shadow-2xl border border-slate-800">
      <div className="font-bold mb-2 text-slate-400 border-b border-slate-800 pb-1 uppercase tracking-tighter">{label} Performance</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color ?? "#94a3b8" }}>{p.name}</span>
          <span className="font-bold">{fmt ? fmt(p) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

interface RevenueQualityChartProps {
  data: RevenueTrendPoint[];
}

export function RevenueQualityChart({ data }: RevenueQualityChartProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-4 px-6 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-lg">Financial Performance</CardTitle>
          <CardDescription className="text-[11px]">Revenue vs Operational Loss (6 Months)</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="h-[260px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/20" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                yAxisId="rev" 
                orientation="left" 
                tickFormatter={fmtM} 
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} 
                axisLine={false} 
                tickLine={false} 
                width={35} 
              />
              <YAxis 
                yAxisId="rate" 
                orientation="right" 
                tickFormatter={v => `${v}%`} 
                tick={{ fontSize: 9, fill: "#ef4444", fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false} 
                domain={[0, 40]} 
                width={25} 
              />
              <Tooltip content={<DarkTip fmt={(p: any) => p.name === "Cancel Rate" ? fmtPct(p.value) : fmtVND(p.value)} />} />
              <Legend verticalAlign="top" align="right" iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '10px' }} />
              <Bar 
                yAxisId="rev" 
                dataKey="revenue" 
                name="Revenue" 
                fill="hsl(var(--primary))" 
                radius={[3, 3, 0, 0]} 
                maxBarSize={40} 
              />
              <Line 
                yAxisId="rate" 
                type="monotone" 
                dataKey="cancelRate" 
                name="Cancel Rate" 
                stroke="#ef4444" 
                strokeWidth={2.5} 
                dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
