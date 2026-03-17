export interface UserProfiles {
  playerId?: string;
  ownerId?: string;
  adminId?: string;
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
