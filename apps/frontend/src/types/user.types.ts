export interface UserProfiles {
  playerId?: string;
  ownerId?: string;
  adminId?: string;
  player?: {
    id?: string;
    status?: string;
  };
  owner?: {
    id?: string;
    status?: string;
    company_name?: string;
    stripe_account_id?: string | null;
    stripe_onboarding_complete?: boolean;
  };
  admin?: {
    id?: string;
    status?: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  avatar?: string;
  roles: string[];
  profiles?: UserProfiles;
}
