export interface Category {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  hourlyRateInr: number;
  currency: string;
  durationMinutes: number;
  imageUrl?: string;
  isActive: boolean;
  availableZones?: string[];
  addons: ServiceAddon[];
}

export interface ServiceAddon {
  id: string;
  name: string;
  priceInr: number;
  durationMinutes: number;
}

export interface Zone {
  id: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
}
