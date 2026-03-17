export interface AddRoleRequest {
  role: "PLAYER" | "OWNER";
  company_name?: string;
}
