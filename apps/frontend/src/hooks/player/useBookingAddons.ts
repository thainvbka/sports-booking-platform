import type { SubfieldProduct } from "@/types";
import { useEffect, useMemo, useState } from "react";

type BookingType = "single" | "recurring";

export function useBookingAddons(
  products: SubfieldProduct[],
  bookingType: BookingType,
) {
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (bookingType === "single") return;
    setAddonQuantities({});
  }, [bookingType]);

  const selectedAddons = useMemo(
    () =>
      products
        .map((product) => ({
          product,
          quantity: addonQuantities[product.id] || 0,
        }))
        .filter((item) => item.quantity > 0),
    [products, addonQuantities],
  );

  const addonSubtotal = useMemo(
    () =>
      selectedAddons.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      ),
    [selectedAddons],
  );

  const addonsPayload = useMemo(
    () =>
      selectedAddons.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    [selectedAddons],
  );

  const updateAddonQuantity = (product: SubfieldProduct, delta: number) => {
    setAddonQuantities((prev) => {
      const current = prev[product.id] || 0;
      const next = Math.max(0, Math.min(product.stock, current + delta));
      return {
        ...prev,
        [product.id]: next,
      };
    });
  };

  return {
    addonQuantities,
    selectedAddons,
    addonSubtotal,
    addonsPayload,
    updateAddonQuantity,
    setAddonQuantities,
  };
}
