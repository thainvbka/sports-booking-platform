"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface RecentPayment {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  bookings?: Array<{
    player?: {
      account?: {
        full_name?: string;
        email?: string;
      };
    };
  }>;
}

interface RecentTransactionsProps {
  payments: RecentPayment[] | undefined;
}

export function RecentTransactions({ payments = [] }: RecentTransactionsProps) {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 pt-4 px-6">
        <div className="space-y-0.5">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription className="text-[11px]">Latest platform payments</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest px-2" asChild>
          <Link to="/admin/payments">
            All <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="space-y-3">
          {payments.slice(0, 8).map((payment) => {
            const playerName =
              payment.bookings?.[0]?.player?.account?.full_name ||
              "Unknown Player";
            const playerEmail =
              payment.bookings?.[0]?.player?.account?.email || "";

            return (
              <div key={payment.id} className="flex items-center justify-between gap-3 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-7 w-7 border shadow-sm">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${playerName}&background=random`}
                      alt={playerName}
                    />
                    <AvatarFallback className="text-[8px] font-black uppercase">
                      {playerName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate leading-none mb-0.5">{playerName}</p>
                    <p className="text-[9px] text-muted-foreground truncate italic tracking-tighter">{playerEmail}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-black leading-none mb-1">
                    {new Intl.NumberFormat("vi-VN").format(payment.amount)} ₫
                  </p>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-tighter">
                      {new Date(payment.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
                    </span>
                    <Badge
                      variant={
                        payment.status === "SUCCESS"
                          ? "default"
                          : payment.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                      }
                      className="h-3 px-1 text-[7px] font-black uppercase rounded-[2px]"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {payments.length === 0 && (
          <div className="text-center py-10 text-muted-foreground italic text-xs">
             No recent activity found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
