export interface BankItem {
  code: string;
  fullName: string;
}

export const VIETNAM_BANKS: BankItem[] = [
  { code: "970436", fullName: "Vietcombank (VCB)" },
  { code: "970415", fullName: "VietinBank (ICB)" },
  { code: "970418", fullName: "BIDV" },
  { code: "970405", fullName: "Agribank" },
  { code: "970422", fullName: "MB Bank (MB)" },
  { code: "970414", fullName: "Techcombank (TCB)" },
  { code: "970432", fullName: "VPBank (VPB)" },
  { code: "970416", fullName: "ACB" },
  { code: "970403", fullName: "Sacombank (STB)" },
  { code: "970441", fullName: "VIB" },
  { code: "970423", fullName: "TPBank (TPB)" },
  { code: "970426", fullName: "MSB" },
  { code: "970448", fullName: "OCB" },
  { code: "970428", fullName: "SHB" },
  { code: "970431", fullName: "Eximbank (EIB)" },
  { code: "970437", fullName: "HDBank (HDB)" },
];

export const BANK_DISPLAY_NAMES: Record<string, string> = {};

VIETNAM_BANKS.forEach((bank) => {
  BANK_DISPLAY_NAMES[bank.code] = bank.fullName;
});

// Add backwards compatibility strings mapping legacy keys to bank code
const LEGACY_MAPPINGS: Record<string, string> = {
  vietcombank: "970436",
  vietinbank: "970415",
  bidv: "970418",
  agribank: "970405",
  mb: "970422",
  techcombank: "970414",
  vpb: "970432",
  acb: "970416",
  sacombank: "970403",
  vib: "970441",
  tpb: "970423",
  msb: "970426",
  ocb: "970448",
  shb: "970428",
  eximbank: "970431",
  hdbank: "970437",
};

Object.entries(LEGACY_MAPPINGS).forEach(([legacyKey, code]) => {
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
