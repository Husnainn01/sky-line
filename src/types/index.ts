export interface Car {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: 'Manual' | 'Automatic';
  fuelType: string;
  drivetrain: string;
  image: string;
  images?: string[];
  description: string;
  features: string[];
  condition: string;
  location: string;
  available: boolean;
  bodyType?: string;
  vin?: string;
  engine?: string;
  cylinders?: number;
  color?: string;
  doors?: number;
  stockNumber?: string;
  steering?: string;
}

export interface FilterOptions {
  searchQuery: string;
  make: string;
  model: string;
  bodyType: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  transmission: string;
  fuel: string;
  drivetrain: string;
  minMileage: number;
  maxMileage: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  carInterest?: string;
}
