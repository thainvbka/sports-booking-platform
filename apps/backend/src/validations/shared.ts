import { getVietnamMinutes } from "../helpers/time.helper";

export const isHalfHourAlignedInVietnam = (date: Date): boolean => {
  return getVietnamMinutes(date) % 30 === 0;
};

export const validateDuration30MinMultiple = (startTime: Date, endTime: Date): boolean => {
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  return durationMinutes > 0 && durationMinutes % 30 === 0;
};
