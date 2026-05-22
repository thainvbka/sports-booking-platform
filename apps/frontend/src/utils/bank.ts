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

export const BANK_DISPLAY_NAMES: Record<string, string> = {
  "970436": "Vietcombank (VCB)",
  "970415": "VietinBank (ICB)",
  "970418": "BIDV",
  "970405": "Agribank",
  "970422": "MB Bank (MB)",
  "970414": "Techcombank (TCB)",
  "970432": "VPBank (VPB)",
  "970416": "ACB",
  "970403": "Sacombank (STB)",
  "970441": "VIB",
  "970423": "TPBank (TPB)",
  "970426": "MSB",
  "970448": "OCB",
  "970428": "SHB",
  "970431": "Eximbank (EIB)",
  "970437": "HDBank (HDB)",
  // backwards compatibility strings
  "vietcombank": "Vietcombank (VCB)",
  "vietinbank": "VietinBank (ICB)",
  "bidv": "BIDV",
  "agribank": "Agribank",
  "mb": "MB Bank (MB)",
  "techcombank": "Techcombank (TCB)",
  "vpb": "VPBank (VPB)",
  "acb": "ACB",
  "sacombank": "Sacombank (STB)",
  "vib": "VIB",
  "tpb": "TPBank (TPB)",
  "msb": "MSB",
  "ocb": "OCB",
  "shb": "SHB",
  "eximbank": "Eximbank (EIB)",
  "hdbank": "HDBank (HDB)",
};

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
