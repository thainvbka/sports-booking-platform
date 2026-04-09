import { Card, CardContent } from "@/components/ui/card";
import type { SubfieldProduct } from "@/types";
import { formatPrice } from "@/utils";
import { format } from "date-fns";

type BookingType = "single" | "recurring";

interface SelectedAddonItem {
  product: SubfieldProduct;
  quantity: number;
}

interface BookingConfirmStepProps {
  subfieldName: string;
  bookingType: BookingType;
  date?: Date;
  endDate?: Date;
  customStartTime: string;
  customEndTime: string;
  selectedAddons: SelectedAddonItem[];
}

export function BookingConfirmStep({
  subfieldName,
  bookingType,
  date,
  endDate,
  customStartTime,
  customEndTime,
  selectedAddons,
}: BookingConfirmStepProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Sân</span>
          <span className="font-medium">{subfieldName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Hình thức</span>
          <span className="font-medium">
            {bookingType === "single" ? "Đặt một lần" : "Đặt định kỳ"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Ngày</span>
          <span className="font-medium">{date ? format(date, "dd/MM/yyyy") : "--/--/----"}</span>
        </div>
        {bookingType === "recurring" && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Đến ngày</span>
            <span className="font-medium">
              {endDate ? format(endDate, "dd/MM/yyyy") : "--/--/----"}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Khung giờ</span>
          <span className="font-medium">
            {customStartTime || "--:--"} - {customEndTime || "--:--"}
          </span>
        </div>

        {selectedAddons.length > 0 && (
          <div className="space-y-1 rounded-md border bg-muted/40 p-3">
            <p className="font-semibold">Add-on đã chọn</p>
            {selectedAddons.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-xs">
                <span>
                  {item.product.name} x{item.quantity}
                </span>
                <span>{formatPrice(Number(item.product.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
