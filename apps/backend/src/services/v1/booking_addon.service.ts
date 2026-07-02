import { Prisma } from "@prisma/client";
import { prisma } from "../../libs/prisma";
import { BookingAddonInput } from "../../validations";

export type NormalizedBookingAddon = {
  product_id: string;
  quantity: number;
};

export const normalizeBookingAddons = (
  addons: BookingAddonInput[] = [],
): NormalizedBookingAddon[] => {
  const quantityByProduct = new Map<string, number>();

  for (const addon of addons) {
    const current = quantityByProduct.get(addon.product_id) ?? 0;
    quantityByProduct.set(addon.product_id, current + addon.quantity);
  }

  return Array.from(quantityByProduct.entries()).map(
    ([product_id, quantity]) => ({
      product_id,
      quantity,
    }),
  );
};

export const calculateAddonSubtotal = (
  addons: Array<{ quantity: number; unit_price: Prisma.Decimal | number }>,
): number =>
  addons.reduce(
    (sum, addon) => sum + Number(addon.unit_price) * addon.quantity,
    0,
  );

export const getBookingAddonSubtotal = async (
  booking_id: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<number> => {
  const addons = await tx.bookingAddon.findMany({
    where: { booking_id },
    select: {
      quantity: true,
      unit_price: true,
    },
  });

  return calculateAddonSubtotal(addons);
};

const incrementProductStock = async (
  tx: Prisma.TransactionClient,
  items: Array<{ product_id: string; quantity: number }>,
) => {
  const quantityByProduct = new Map<string, number>();

  for (const item of items) {
    const current = quantityByProduct.get(item.product_id) ?? 0;
    quantityByProduct.set(item.product_id, current + item.quantity);
  }

  await Promise.all(
    Array.from(quantityByProduct.entries()).map(([product_id, quantity]) =>
      tx.product.update({
        where: { id: product_id },
        data: {
          stock: { increment: quantity },
        },
      }),
    ),
  );
};

export const restoreAddonStockForBookingIds = async (
  tx: Prisma.TransactionClient,
  bookingIds: string[],
) => {
  if (!bookingIds.length) {
    return;
  }

  const addons = await tx.bookingAddon.findMany({
    where: {
      booking_id: { in: bookingIds },
    },
    select: {
      product_id: true,
      quantity: true,
    },
  });

  if (!addons.length) {
    return;
  }

  await incrementProductStock(tx, addons);
};

export const restoreAddonStockForBooking = async (
  tx: Prisma.TransactionClient,
  booking_id: string,
) => restoreAddonStockForBookingIds(tx, [booking_id]);

/**
 * CHỈ khôi phục tồn kho cho dụng cụ THUÊ (RENTAL) khi booking hoàn thành/kết thúc thời gian chơi
 */
export const restoreRentalAddonStockForBookingIds = async (
  tx: Prisma.TransactionClient,
  bookingIds: string[],
) => {
  if (!bookingIds.length) return;

  const rentalAddons = await tx.bookingAddon.findMany({
    where: {
      booking_id: { in: bookingIds },
      product: {
        type: "RENTAL",
      },
    },
    select: {
      product_id: true,
      quantity: true,
    },
  });

  if (!rentalAddons.length) return;

  await incrementProductStock(tx, rentalAddons);
};

