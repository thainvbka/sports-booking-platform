import { ownerService } from "@/services/owner.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useStripeConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsChecking(true);
    ownerService
      .getStripeStatus()
      .then((data) => {
        setIsConnected(data.data.isComplete);
      })
      .catch((err) => {
        toast.error(
          "Đã có lỗi xảy ra khi kiểm tra trạng thái kết nối Stripe. Vui lòng thử lại sau.",
        );
        console.error("Lỗi khi lấy trạng thái Stripe:", err);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  const handleConnectStripe = async () => {
    try {
      const data = await ownerService.createStripeLink();
      window.location.href = data.data.url;
    } catch (err) {
      toast.error(
        "Đã có lỗi xảy ra khi kết nối với Stripe. Vui lòng thử lại sau.",
      );
      console.error("Lỗi kết nối Stripe:", err);
    }
  };

  return {
    isConnected,
    isChecking,
    handleConnectStripe,
  };
}
