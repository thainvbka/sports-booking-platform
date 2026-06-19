import { BANK_LEGACY_MAPPINGS, VIETNAM_BANKS } from "@/constants";


export const BANK_DISPLAY_NAMES: Record<string, string> = {};

VIETNAM_BANKS.forEach((bank) => {
  BANK_DISPLAY_NAMES[bank.code] = bank.fullName;
});

Object.entries(BANK_LEGACY_MAPPINGS).forEach(([legacyKey, code]) => {
  const bank = VIETNAM_BANKS.find((b) => b.code === code);
  if (bank) {
    BANK_DISPLAY_NAMES[legacyKey] = bank.fullName;
  }
});

export const mapToBankBin = (name: string): string => {
  if (!name) return "";
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("vietcom") || normalized === "vcb" || normalized === "970436") return "970436";
  if (normalized.includes("vietin") || normalized.includes("icb") || normalized === "970415") return "970415";
  if (normalized.includes("bidv") || normalized === "970418") return "970418";
  if (normalized.includes("agri") || normalized === "970405") return "970405";
  if (normalized === "mb" || normalized.includes("mbbank") || normalized === "970422") return "970422";
  if (normalized.includes("techcom") || normalized === "tcb" || normalized === "970414") return "970414";
  if (normalized.includes("vpbank") || normalized.includes("vpb") || normalized === "970432") return "970432";
  if (normalized === "acb" || normalized === "970416") return "970416";
  if (normalized.includes("sacom") || normalized === "stb" || normalized === "970403") return "970403";
  if (normalized === "vib" || normalized === "970441") return "970441";
  if (normalized.includes("tpbank") || normalized === "tpb" || normalized === "970423") return "970423";
  if (normalized === "msb" || normalized === "970426") return "970426";
  if (normalized === "ocb" || normalized === "970448") return "970448";
  if (normalized === "shb" || normalized === "970428") return "970428";
  if (normalized.includes("exim") || normalized === "eib" || normalized === "970431") return "970431";
  if (normalized.includes("hdbank") || normalized === "hdb" || normalized === "970437") return "970437";
  return name;
};

export const getBankDisplayName = (code: string): string => {
  if (!code) return "N/A";
  const normalized = code.toLowerCase().trim();
  return BANK_DISPLAY_NAMES[normalized] || code.toUpperCase();
};
