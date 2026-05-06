export interface Room {
  id: string;
  title: string;
  price: number;
  area: number;
  district: 'Tân Phú' | 'Tân Bình' | 'Bình Tân';
  ward: string;
  street: string;
  address: string;
  description: string;
  amenities: string[];
  images: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  contactPhone: string;
  isFeatured?: boolean;
  status: 'available' | 'unavailable';
  createdAt: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  createdAt?: any;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  content: string;
  roomId?: string;
  isRead?: boolean;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface Review {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatar?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface AppSettings {
  hotline: string;
  zalo: string;
  fanpage: string;
  seo?: SEOSettings;
}

export interface SEOSettings {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
}

export interface MediaLibraryItem {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: any;
}
