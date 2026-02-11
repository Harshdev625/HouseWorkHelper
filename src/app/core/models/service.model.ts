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
  startingPrice: number;
  currency: string;
  typicalDurationMinutes: number;
  isActive: boolean;
  availableZones: string[];
  addons: ServiceAddon[];
}

export interface ServiceAddon {
  id: string;
  name: string;
  priceDelta: number;
  durationDeltaMinutes: number;
}

export interface Zone {
  id: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
}
