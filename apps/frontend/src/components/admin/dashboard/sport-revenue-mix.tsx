import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SportRevenuePoint } from "@/types/admin.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "hsl(var(--primary))",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const fmtM = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);
const fmtVND = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)} ₫`;

interface SportRevenueMixProps {
  data: SportRevenuePoint[];
}

export function SportRevenueMix({ data }: SportRevenueMixProps) {
  const totalSportRev = data.reduce((s, x) => s + x.revenue, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-4 px-6">
        <CardTitle className="text-lg">Revenue by Sport</CardTitle>
        <CardDescription className="text-[11px]">Completed bookings distribution</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="relative mb-4 h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={data} 
                cx="50%" 
                cy="50%" 
                innerRadius={45} 
                outerRadius={65} 
                dataKey="revenue" 
                paddingAngle={3}
                stroke="none"
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '10px' }} 
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-[8px] text-muted-foreground font-black uppercase leading-tight">Total</p>
            <p className="text-sm font-bold leading-none">{fmtM(totalSportRev)}</p>
          </div>
        </div>
        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
          {data.slice(0, 6).map((s, i) => (
            <div key={s.name} className="flex justify-between items-center text-[10px]">
              <span className="flex items-center gap-1.5 font-bold text-muted-foreground uppercase tracking-tighter">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }}></span>
                <span className="truncate max-w-[80px]">{s.name}</span>
              </span>
              <span className="font-bold text-foreground">
                {fmtVND(s.revenue)} <span className="text-muted-foreground/30 mx-0.5">|</span> {s.bookings}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
