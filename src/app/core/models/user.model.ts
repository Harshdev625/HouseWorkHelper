export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_EXPERT';

export interface User {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  password: string;
  roles: UserRole[];
  blocked: boolean;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  age?: number | null;
  address?: string | null;
  preferredZoneIds: string[];
}

export interface ExpertProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  skills: string[];
  zoneIds: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  onlineStatus: 'ONLINE' | 'OFFLINE';
  rating: number;
  totalJobs: number;
  idProof?: any;
  createdAt: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
  profile?: CustomerProfile | ExpertProfile;
}

export interface RegisterCustomerRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  age?: number;
  address?: string;
  preferredZoneIds?: string[];
}

export interface RegisterExpertRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  skills: string[];
  zoneIds?: string[];
  idProof?: any;
}
