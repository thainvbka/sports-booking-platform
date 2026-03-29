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
import { Eye } from "lucide-react";
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
    <Card className="cursor-pointer h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest customer payments</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="cursor-pointer" asChild>
          <Link to="/admin/payments">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {payments.slice(0, 5).map((payment) => {
          const playerName =
            payment.bookings?.[0]?.player?.account?.full_name ||
            "Unknown Player";
          const playerEmail =
            payment.bookings?.[0]?.player?.account?.email || "";

          return (
            <div key={payment.id}>
              <div className="flex p-3 rounded-lg border gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${playerName}&background=random`}
                    alt={playerName}
                  />
                  <AvatarFallback>
                    {playerName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 items-center flex-wrap justify-between gap-1">
                  <div className="flex items-center space-x-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {playerName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {playerEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        payment.status === "SUCCESS"
                          ? "default"
                          : payment.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                      }
                      className="cursor-pointer"
                    >
                      {payment.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(payment.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {payments.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No recent payments
          </div>
        )}
      </CardContent>
    </Card>
  );
}
