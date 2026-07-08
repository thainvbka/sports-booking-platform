import { SportType } from "@prisma/client";

export const SPORT_NAME_MAP: Record<SportType, string> = {
  [SportType.BADMINTON]: "Cầu lông",
  [SportType.FOOTBALL]: "Bóng đá",
  [SportType.BASKETBALL]: "Bóng rổ",
  [SportType.TENNIS]: "Tennis",
  [SportType.VOLLEYBALL]: "Bóng chuyền",
  [SportType.PICKLEBALL]: "Pickleball",
};

export const translatePreferredTime = (avgHour: number): string => {
  if (avgHour < 12) return "Buổi sáng (trước 12h)";
  if (avgHour < 18) return "Buổi chiều (12h - 18h)";
  return "Buổi tối (sau 18h)";
};

export const translatePreferredDays = (weekendRatio: number): string => {
  if (weekendRatio > 0.6) return "Cuối tuần (Thứ 7, Chủ Nhật)";
  if (weekendRatio < 0.4) return "Ngày thường (Thứ 2 - Thứ 6)";
  return "Linh hoạt cả tuần";
};

export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Hanoi
  "hoàn kiếm": { lat: 21.0285, lng: 105.8542 },
  "ba đình": { lat: 21.0353, lng: 105.8156 },
  "cầu giấy": { lat: 21.0362, lng: 105.7906 },
  "đống đa": { lat: 21.0180, lng: 105.8299 },
  "hai bà trưng": { lat: 21.0125, lng: 105.8475 },
  "tây hồ": { lat: 21.0628, lng: 105.8105 },
  "thanh xuân": { lat: 20.9937, lng: 105.8115 },
  "hoàng mai": { lat: 20.9686, lng: 105.8431 },
  "long biên": { lat: 21.0366, lng: 105.8973 },
  "hà đông": { lat: 20.9688, lng: 105.7766 },
  "nam từ liêm": { lat: 21.0134, lng: 105.7645 },
  "bắc từ liêm": { lat: 21.0664, lng: 105.7725 },
  
  // HCM
  "quận 1": { lat: 10.7769, lng: 106.7009 },
  "quận 3": { lat: 10.7788, lng: 106.6798 },
  "quận 4": { lat: 10.7583, lng: 106.7067 },
  "quận 5": { lat: 10.7540, lng: 106.6631 },
  "quận 6": { lat: 10.7483, lng: 106.6358 },
  "quận 7": { lat: 10.7340, lng: 106.7219 },
  "quận 8": { lat: 10.7241, lng: 106.6276 },
  "quận 10": { lat: 10.7747, lng: 106.6660 },
  "quận 11": { lat: 10.7630, lng: 106.6508 },
  "quận 12": { lat: 10.8672, lng: 106.6410 },
  "bình thạnh": { lat: 10.8106, lng: 106.7091 },
  "gò vấp": { lat: 10.8388, lng: 106.6683 },
  "phú nhuận": { lat: 10.7992, lng: 106.6803 },
  "tân bình": { lat: 10.8015, lng: 106.6525 },
  "tân phú": { lat: 10.7901, lng: 106.6183 },
  "bình tân": { lat: 10.7649, lng: 106.5925 },
  "thủ đức": { lat: 10.8494, lng: 106.7716 },

  // Da Nang (Some major districts)
  "hải châu": { lat: 16.0469, lng: 108.2204 },
  "thanh khê": { lat: 16.0617, lng: 108.1923 },
  "sơn trà": { lat: 16.0883, lng: 108.2570 },
  "ngũ hành sơn": { lat: 16.0270, lng: 108.2464 },
  "liên chiểu": { lat: 16.0967, lng: 108.1487 },
  "cẩm lệ": { lat: 15.9981, lng: 108.1969 },
};

export const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "an giang": { lat: 10.5369, lng: 105.1258 },
  "bà rịa - vũng tàu": { lat: 10.5113, lng: 107.1687 },
  "bà rịa vũng tàu": { lat: 10.5113, lng: 107.1687 },
  "bắc giang": { lat: 21.3216, lng: 106.2625 },
  "bắc kạn": { lat: 22.1953, lng: 105.8642 },
  "bạc liêu": { lat: 9.3242, lng: 105.5181 },
  "bắc ninh": { lat: 21.1444, lng: 106.0911 },
  "bến tre": { lat: 10.1654, lng: 106.4025 },
  "bình định": { lat: 14.1611, lng: 108.9972 },
  "bình dương": { lat: 11.2003, lng: 106.6631 },
  "bình phước": { lat: 11.7516, lng: 106.9117 },
  "bình thuận": { lat: 11.1186, lng: 108.1754 },
  "cà mau": { lat: 9.1414, lng: 105.0061 },
  "cần thơ": { lat: 10.0264, lng: 105.6722 },
  "cao bằng": { lat: 22.7161, lng: 105.9556 },
  "đà nẵng": { lat: 16.0544, lng: 108.2022 },
  "đắk lắk": { lat: 12.7533, lng: 108.2119 },
  "đắk nông": { lat: 12.1856, lng: 107.6744 },
  "điện biên": { lat: 21.7242, lng: 103.0181 },
  "đồng nai": { lat: 11.0361, lng: 107.1956 },
  "đồng tháp": { lat: 10.5283, lng: 105.6975 },
  "gia lai": { lat: 13.9856, lng: 108.1656 },
  "hà giang": { lat: 22.7533, lng: 104.9117 },
  "hà nam": { lat: 20.5264, lng: 105.9222 },
  "hà nội": { lat: 21.0285, lng: 105.8542 },
  "hà tĩnh": { lat: 18.3242, lng: 105.8972 },
  "hải dương": { lat: 20.9406, lng: 106.3331 },
  "hải phòng": { lat: 20.8444, lng: 106.6881 },
  "hậu giang": { lat: 9.7844, lng: 105.6411 },
  "hòa bình": { lat: 20.6111, lng: 105.3331 },
  "hồ chí minh": { lat: 10.7769, lng: 106.7009 },
  "hưng yên": { lat: 20.8111, lng: 106.0167 },
  "khánh hòa": { lat: 12.2856, lng: 109.1117 },
  "kiên giang": { lat: 9.9414, lng: 105.1117 },
  "kon tum": { lat: 14.4111, lng: 107.9556 },
  "lai châu": { lat: 22.3533, lng: 103.4975 },
  "lâm đồng": { lat: 11.6631, lng: 107.9856 },
  "lạng sơn": { lat: 21.8444, lng: 106.6111 },
  "lào cai": { lat: 22.3242, lng: 104.1687 },
  "long an": { lat: 10.6111, lng: 106.0167 },
  "nam định": { lat: 20.3242, lng: 106.2119 },
  "nghệ an": { lat: 19.3242, lng: 104.8972 },
  "ninh bình": { lat: 20.2119, lng: 105.9556 },
  "ninh thuận": { lat: 11.6631, lng: 108.9117 },
  "phú thọ": { lat: 21.3242, lng: 105.2119 },
  "phú yên": { lat: 13.1654, lng: 109.0911 },
  "quảng bình": { lat: 17.5113, lng: 106.3242 },
  "quảng nam": { lat: 15.6111, lng: 107.9117 },
  "quảng ngãi": { lat: 15.0264, lng: 108.7975 },
  "quảng ninh": { lat: 21.2119, lng: 107.3242 },
  "quảng trị": { lat: 16.7111, lng: 107.1117 },
  "sóc trăng": { lat: 9.6111, lng: 106.0167 },
  "sơn la": { lat: 21.2003, lng: 103.9117 },
  "tây ninh": { lat: 11.4111, lng: 106.1117 },
  "thái bình": { lat: 20.5113, lng: 106.4025 },
  "thái nguyên": { lat: 21.6111, lng: 105.8117 },
  "thanh hóa": { lat: 20.0883, lng: 105.4975 },
  "thừa thiên huế": { lat: 16.3242, lng: 107.6111 },
  "thừa thiên - huế": { lat: 16.3242, lng: 107.6111 },
  "huế": { lat: 16.3242, lng: 107.6111 },
  "tiền giang": { lat: 10.4264, lng: 106.2119 },
  "trà vinh": { lat: 9.8111, lng: 106.3242 },
  "tuyên quang": { lat: 22.1113, lng: 105.2119 },
  "vĩnh long": { lat: 10.2119, lng: 106.0167 },
  "vĩnh phúc": { lat: 21.3242, lng: 105.5181 },
  "yên bái": { lat: 21.7111, lng: 104.5283 },
};

