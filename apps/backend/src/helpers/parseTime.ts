export const parseTime = (timeStr?: string): Date => {
  if (!timeStr) {
    return new Date(0);
  }
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(0); // 1970-01-01T00:00:00.000Z
  date.setHours(hours, minutes, 0, 0);
  return date;
};
