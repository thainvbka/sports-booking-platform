import type { PaymentProviderPoint } from "@/types/admin.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const fmtVND = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)} ₫`;

interface PaymentProvidersProps {
  data: PaymentProviderPoint[];
}

export function PaymentProviders({ data }: PaymentProvidersProps) {
  const maxCount = Math.max(...data.map(x => x.bookings), 1);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 pt-4 px-6">
        <CardTitle className="text-lg">Gateways</CardTitle>
        <CardDescription className="text-[11px]">Usage & transaction values (30d)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pb-4">
        {data.map((p, i) => (
          <div key={p.provider} className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{p.provider}</span>
              <div className="text-right">
                <span className="text-[10px] font-bold">{p.bookings} txn</span>
                <span className="text-[9px] text-muted-foreground ml-1.5 font-medium">{fmtVND(p.revenue)}</span>
              </div>
            </div>
            <Progress 
              value={(p.bookings / maxCount) * 100} 
              className="h-1" 
              indicatorClassName={i === 0 ? "bg-blue-500" : i === 1 ? "bg-amber-500" : "bg-emerald-500"}
            />
            <p className="text-[9px] text-muted-foreground text-right italic leading-none pt-0.5">Avg {fmtVND(p.avgTransaction)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
