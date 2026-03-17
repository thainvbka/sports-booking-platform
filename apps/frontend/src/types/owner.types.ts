import type {
  ComplexDetail,
  ComplexListItem,
  PaginationMeta,
  PricingRule,
} from "./index";

export interface GetOwnerComplexesResponse {
  complexes: ComplexListItem[];
  pagination: PaginationMeta;
}

export interface GetOwnerComplexByIdResponse {
  complex: ComplexDetail;
  pagination: PaginationMeta;
}

export interface CreateComplexResponse {
  complex: ComplexListItem;
}

export interface GetOwnerPricingRulesResponse {
  pricingRules: PricingRule[];
}
