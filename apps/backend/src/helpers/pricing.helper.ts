import { PricingRule } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { BadRequestError } from "../utils/error.response";
import {
  getRawMinutes,
  getVietnamDayOfWeek,
  getVietnamMinutes,
} from "./time.helper";

export interface PriceSegment {
  rule_id: string;
  start_min: number;
  end_min: number;
  duration_min: number;
  base_price: number;
  segment_price: number;
}

export interface PriceCalculationResult {
  totalPrice: number;
  breakdown: PriceSegment[];
}

const minutesToTime = (min: number): string => {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

/**
 * Tính giá booking từ danh sách rules đã fetch sẵn.
 * Caller tự fetch rules trước để tránh N+1 query (dùng trong recurring booking).
 */
export const calculatePrice = (
  rules: PricingRule[],
  startTime: Date,
  endTime: Date,
): PriceCalculationResult => {
  const bookingStartMin = getVietnamMinutes(startTime);
  const bookingEndMin = getVietnamMinutes(endTime);

  const overlappingRules = rules
    .filter((rule) => {
      const ruleStartMin = getRawMinutes(rule.start_time);
      const ruleEndMin = getRawMinutes(rule.end_time);
      return ruleStartMin < bookingEndMin && ruleEndMin > bookingStartMin;
    })
    .sort((a, b) => getRawMinutes(a.start_time) - getRawMinutes(b.start_time));

  if (overlappingRules.length === 0) {
    throw new BadRequestError(
      "Giờ đặt không hợp lệ hoặc nằm ngoài khung giờ hoạt động của sân.",
    );
  }

  let totalPrice = 0;
  let currentMin = bookingStartMin;
  const breakdown: PriceSegment[] = [];

  for (const rule of overlappingRules) {
    const ruleStartMin = getRawMinutes(rule.start_time);
    const ruleEndMin = getRawMinutes(rule.end_time);

    const segmentStart = Math.max(currentMin, ruleStartMin);
    const segmentEnd = Math.min(bookingEndMin, ruleEndMin);

    if (segmentStart < segmentEnd) {
      const duration_min = segmentEnd - segmentStart;
      const segment_price = Number(rule.base_price) * (duration_min / 60);

      totalPrice += segment_price;
      breakdown.push({
        rule_id: rule.id,
        start_min: segmentStart,
        end_min: segmentEnd,
        duration_min,
        base_price: Number(rule.base_price),
        segment_price,
      });
      currentMin = segmentEnd;
    }

    if (currentMin >= bookingEndMin) break;
  }

  if (currentMin < bookingEndMin) {
    throw new BadRequestError(
      `Khung giờ ${minutesToTime(currentMin)} - ${minutesToTime(bookingEndMin)} không có giá. Vui lòng chọn khung giờ khác.`,
    );
  }

  return { totalPrice, breakdown };
};

/**
 * Fetch pricing rules rồi tính giá — dùng cho single booking.
 */
export const fetchAndCalculatePrice = async (
  sub_field_id: string,
  startTime: Date,
  endTime: Date,
): Promise<PriceCalculationResult> => {
  const dayOfWeek = getVietnamDayOfWeek(startTime);

  const rules = await prisma.pricingRule.findMany({
    where: { sub_field_id, day_of_week: dayOfWeek },
  });

  if (!rules.length) {
    throw new BadRequestError("Sân chưa thiết lập bảng giá cho ngày này.");
  }

  return calculatePrice(rules, startTime, endTime);
};
