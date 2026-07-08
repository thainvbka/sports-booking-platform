import { SportType } from "@prisma/client";
import { DISTRICT_COORDINATES, PROVINCE_COORDINATES } from "./constants";

/**
 * Normalizes different features into a [0, 1] range for feature vectors.
 */

export const normalizeSport = (sport: SportType): number => {
  
  const sportMap: Record<SportType, number> = {
    [SportType.FOOTBALL]: 1.0,
    [SportType.VOLLEYBALL]: 0.8,
    [SportType.BASKETBALL]: 0.6,
    [SportType.TENNIS]: 0.4,
    [SportType.BADMINTON]: 0.2,
    [SportType.PICKLEBALL]: 0.1,
  };
  return sportMap[sport] ?? 0.5;
};

export const normalizeHour = (hour: number): number => {
  // Linear scaling between 5:00 AM (typical earliest booking slot) and 11:00 PM (23:00, latest slot)
  const minHour = 5;
  const maxHour = 23;
  const clamped = Math.max(minHour, Math.min(hour, maxHour));
  return (clamped - minHour) / (maxHour - minHour);
};

export const normalizeWeekday = (ratio: number): number => {
  return Math.max(0, Math.min(ratio, 1));
};

export const normalizePrice = (
  value: number,
  min: number,
  max: number,
): number => {
  if (max === min) return 0.5;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(normalized, 1));
};

const cleanProvince = (province: string): string => {
  let p = province.toLowerCase().trim();
  p = p.replace(/^(thành\s+phố|tỉnh|tp\.?)\s+/i, "");
  if (p === "hcm" || p === "hồ chí minh" || p === "tp.hcm" || p === "ho chi minh") {
    return "hồ chí minh";
  }
  if (p === "hn" || p === "hà nội" || p === "ha noi") {
    return "hà nội";
  }
  if (p === "đn" || p === "đà nẵng" || p === "da nang") {
    return "đà nẵng";
  }
  return p;
};

const cleanDistrict = (district: string): string => {
  let d = district.toLowerCase().trim();
  d = d.replace(/^tp\.?\s+/i, "thành phố ");
  return d;
};

export const extractLocationScope = (address: string): string => {
  if (!address) return "";
  
  const parts = address.split(",").map(p => p.trim());
  
  if (parts.length >= 2) {
    const rawDistrict = parts[parts.length - 2];
    const rawProvince = parts[parts.length - 1];
    
    const cleanD = cleanDistrict(rawDistrict);
    const cleanP = cleanProvince(rawProvince);
    
    if (cleanD && cleanP) {
      return `${cleanD} - ${cleanP}`;
    }
  }
  
  // Fallback for single-part or raw inputs (without commas)
  const cleanAddr = address.toLowerCase().trim();
  const provinces = [
    // Tên chuẩn tiếng Việt có dấu
    "thành phố hồ chí minh", "thành phố hải phòng", "thành phố đà nẵng", "thành phố cần thơ", 
    "thừa thiên huế", "thái nguyên", "tuyên quang", "thanh hóa", "quảng ninh", "quảng ngãi", 
    "quảng trị", "ninh bình", "khánh hòa", "lâm đồng", "lạng sơn", "lai châu", "điện biên", 
    "hưng yên", "bắc ninh", "đắk lắk", "đồng nai", "tây ninh", "vĩnh long", "đồng tháp", 
    "an giang", "nghệ an", "hà nội", "hà tĩnh", "cao bằng", "sơn la", "lào cai", "phú thọ", 
    "cà mau", "huế",

    // Biến thể không dấu bọc lót lỗi gõ
    "thành pho ho chi minh", "thanh pho hai phong", "thanh pho da nang", "thanh pho can tho",
    "ho chi minh", "hai phong", "da nang", "can tho", "thua thien hue", "thai nguyen", 
    "tuyen quang", "thanh hoa", "quang ninh", "quang ngai", "quang tri", "ninh binh", 
    "khanh hoa", "lam dong", "lang son", "lai chau", "dien bien", "hung yen", "bac ninh", 
    "dak lak", "dong nai", "tay ninh", "vinh long", "dong thap", "an giang", "nghe an", 
    "ha noi", "ha tinh", "cao bang", "son la", "lao cai", "phu tho", "ca mau", "hue",

    // Các ký tự viết tắt thương mại phổ biến
    "tp.hcm", "tphcm", "hcm", "hn", "đn", "dn", "hp", "ct"
  ];

  let detectedProvince = "";
  for (const prov of provinces) {
    if (cleanAddr.endsWith(prov) || cleanAddr.includes(` ${prov}`)) {
      detectedProvince = prov;
      break;
    }
  }

  if (detectedProvince) {
    const cleanP = cleanProvince(detectedProvince);
    const beforeProvince = cleanAddr.substring(0, cleanAddr.indexOf(detectedProvince)).trim();
    // Match the last admin unit: quận, huyện, thị xã, thành phố, tp, xã, phường
    const match = beforeProvince.match(/(quận|huyện|thị\s*xã|thành\s*phố|tp|xã|phường)\s+[a-zà-ỹ0-9\s]+/gi);
    if (match && match.length > 0) {
      const cleanD = cleanDistrict(match[match.length - 1]);
      return `${cleanD} - ${cleanP}`;
    }
    const cleanD = beforeProvince.replace(/,\s*$/, "").trim();
    if (cleanD) {
      return `${cleanDistrict(cleanD)} - ${cleanP}`;
    }
  }
  
  return cleanAddr;
};

export const normalizeDistrict = (address: string): number => {
  if (!address) return 0.5;

  const locScope = extractLocationScope(address).toLowerCase();
  
  // Default coordinates (approximate center point of Vietnam, e.g., Da Nang)
  let coord = { lat: 16.0, lng: 106.0 };
  let found = false;

  // 1. Match specific district coordinate first
  for (const [key, val] of Object.entries(DISTRICT_COORDINATES)) {
    if (locScope.includes(key)) {
      coord = val;
      found = true;
      break;
    }
  }

  // 2. If not found, match general province coordinate
  if (!found) {
    for (const [key, val] of Object.entries(PROVINCE_COORDINATES)) {
      if (locScope.includes(key)) {
        coord = val;
        found = true;
        break;
      }
    }
  }

  // Normalize Lat [10.0, 22.0] -> [0.0, 1.0]
  const latNorm = (coord.lat - 10.0) / 12.0;
  // Normalize Lng [105.0, 109.0] -> [0.0, 1.0]
  const lngNorm = (coord.lng - 105.0) / 4.0;

  const projected = 0.6 * Math.max(0, Math.min(latNorm, 1)) + 0.4 * Math.max(0, Math.min(lngNorm, 1));
  return Math.max(0, Math.min(projected, 1));
};

export const normalizeRating = (avg: number | null): number => {
  const rating = avg ?? 3.5;
  return Math.max(0, Math.min(rating / 5, 1));
};

export const normalizeFrequency = (count: number, maxFrequency: number = 30): number => {
  if (maxFrequency === 0) return 0.5;
  return Math.max(0, Math.min(count / maxFrequency, 1));
};

export const normalizeRecency = (daysAgo: number): number => {
  return Math.max(0, Math.min(1 - daysAgo / 30, 1));
};
