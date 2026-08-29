/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'CUSTOMER' | 'MECHANIC' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export type VehicleType = 'Car' | 'Bike' | 'SUV' | 'Truck';

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: VehicleType;
}

export interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewsCount: number;
  contactNumber: string;
  image: string;
  branches: string[];
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedTime: string; // e.g., "3-4 hours"
  features: string[];
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'VEHICLE_RECEIVED'
  | 'INSPECTION'
  | 'SERVICE_IN_PROGRESS'
  | 'WAITING_FOR_SPARE_PARTS'
  | 'QUALITY_CHECK'
  | 'READY_FOR_DELIVERY'
  | 'COMPLETED';

export interface SparePartUsed {
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  vehicleId: string;
  vehicleDetails: {
    make: string;
    model: string;
    licensePlate: string;
  };
  serviceCenterId: string;
  serviceCenterName: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  bookingDate: string;
  bookingTime: string;
  pickupRequested: boolean;
  pickupLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  pickupCharge: number;
  status: BookingStatus;
  mechanicId?: string;
  mechanicName?: string;
  repairImages: string[];
  repairNotes?: string;
  sparePartsUsed: SparePartUsed[];
  paymentStatus: 'PENDING' | 'COMPLETED' | 'PENDING_APPROVAL';
  paymentMethod?: 'Razorpay' | 'UPI';
  upiUtr?: string;
  paymentId?: string;
  totalAmount: number;
  invoiceId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  serviceCenterId: string;
  rating: number;
  comment: string;
  date: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  isFake?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface SparePartInventory {
  id: string;
  name: string;
  stock: number;
  price: number;
  minStock: number;
  category: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  active: boolean;
}

export interface Membership {
  userId: string;
  tier: 'None' | 'Silver' | 'Gold' | 'Platinum';
  loyaltyPoints: number;
  referralCode: string;
  referredCount: number;
}

export interface DocumentReminder {
  id: string;
  userId: string;
  type: 'PUC' | 'Insurance' | 'RC' | 'License';
  docName: string;
  expiryDate: string;
  status: 'Active' | 'Expired';
}

export interface ExpenseLog {
  id: string;
  userId: string;
  type: 'Fuel' | 'Maintenance';
  amount: number;
  date: string;
  description: string;
  gallonsOrLiters?: number;
}

