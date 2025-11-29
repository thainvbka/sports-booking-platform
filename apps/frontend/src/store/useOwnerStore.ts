import { create } from "zustand";
import type { Complex, SubField, PricingRule, Owner } from "@/types";

interface OwnerState {
  owner: Owner | null;
  complexes: Complex[];
  selectedComplex: Complex | null;
  setOwner: (owner: Owner) => void;
  setComplexes: (complexes: Complex[]) => void;
  setSelectedComplex: (complex: Complex | null) => void;
  addComplex: (complex: Complex) => void;
  updateComplex: (id: string, data: Partial<Complex>) => void;
  addSubField: (complexId: string, subField: SubField) => void;
  addPricingRule: (subFieldId: string, rule: PricingRule) => void;
}

export const useOwnerStore = create<OwnerState>((set) => ({
  owner: null,
  complexes: [],
  selectedComplex: null,

  setOwner: (owner) => set({ owner }),

  setComplexes: (complexes) => set({ complexes }),

  setSelectedComplex: (complex) => set({ selectedComplex: complex }),

  addComplex: (complex) =>
    set((state) => ({
      complexes: [...state.complexes, complex],
    })),

  updateComplex: (id, data) =>
    set((state) => ({
      complexes: state.complexes.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),

  addSubField: (complexId, subField) =>
    set((state) => ({
      complexes: state.complexes.map((c) =>
        c.id === complexId
          ? { ...c, sub_fields: [...c.sub_fields, subField] }
          : c
      ),
    })),

  addPricingRule: (subFieldId, rule) =>
    set((state) => ({
      complexes: state.complexes.map((c) => ({
        ...c,
        sub_fields: c.sub_fields.map((sf) =>
          sf.id === subFieldId
            ? { ...sf, pricing_rules: [...sf.pricing_rules, rule] }
            : sf
        ),
      })),
    })),
}));
