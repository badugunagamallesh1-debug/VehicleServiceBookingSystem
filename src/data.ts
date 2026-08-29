/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceCenter, ServicePackage } from './types';

export const INITIAL_SERVICE_CENTERS: ServiceCenter[] = [
  {
    id: 'sc-1',
    name: 'Precision Auto Care & Diagnostics',
    address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
    latitude: 37.4220,
    longitude: -122.0841,
    rating: 4.8,
    reviewsCount: 124,
    contactNumber: '+1 (650) 253-0000',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600',
    branches: ['Mountain View Main', 'Palo Alto Express']
  },
  {
    id: 'sc-2',
    name: 'Elite Motors Service Hub',
    address: '2025 Guadalupe St, Austin, TX 78705',
    latitude: 30.2827,
    longitude: -97.7417,
    rating: 4.7,
    reviewsCount: 98,
    contactNumber: '+1 (512) 471-1234',
    image: 'https://images.unsplash.com/photo-1617886322168-72b886573c3c?auto=format&fit=crop&q=80&w=600',
    branches: ['Austin Downtown', 'North Austin Branch']
  },
  {
    id: 'sc-3',
    name: 'Apex Superbike & Car Service',
    address: '350 5th Ave, New York, NY 10118',
    latitude: 40.7484,
    longitude: -73.9857,
    rating: 4.9,
    reviewsCount: 210,
    contactNumber: '+1 (212) 736-3100',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600',
    branches: ['Empire State Main', 'Brooklyn Service Point']
  },
  {
    id: 'sc-4',
    name: 'West Coast Hybrid & Electric Garage',
    address: '1 Infinite Loop, Cupertino, CA 95014',
    latitude: 37.3318,
    longitude: -122.0308,
    rating: 4.6,
    reviewsCount: 85,
    contactNumber: '+1 (408) 996-1010',
    image: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=600',
    branches: ['Cupertino Loop', 'San Jose Hybrid']
  }
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg-1',
    name: 'Standard Periodic Service',
    description: 'Essential preventive maintenance to keep your vehicle running smoothly. Recommended every 5,000 miles.',
    price: 99,
    estimatedTime: '2-3 Hours',
    features: [
      'Engine Oil Replacement',
      'Oil Filter Change',
      'Air Filter Cleaning',
      'Coolant Top-up',
      '30-Point Comprehensive Inspection',
      'Basic Exterior Wash & Vacuum'
    ]
  },
  {
    id: 'pkg-2',
    name: 'Comprehensive Gold Service',
    description: 'Thorough inspection and premium servicing for flawless performance. Recommended every 15,000 miles.',
    price: 199,
    estimatedTime: '4-5 Hours',
    features: [
      'Everything in Standard Service',
      'Air Filter Replacement',
      'Spark Plug Diagnostics & Cleaning',
      'Wheel Alignment & Balance',
      'Brake Pad Service & Fluid Flush',
      'Battery Voltage Check & Terminal Cleaning',
      'Interior Deep Cleaning'
    ]
  },
  {
    id: 'pkg-3',
    name: 'Premium Platinum Tuning & Detailing',
    description: 'The ultimate care package including system diagnostic reports, custom engine tuning, and premium wax polish.',
    price: 349,
    estimatedTime: '6-8 Hours',
    features: [
      'Everything in Gold Service',
      'OBD-II Engine Diagnostic Scan',
      'AC Filter Replacement & Vent Cleaning',
      'Fuel Injector Flush',
      'Throttle Body Cleaning',
      'Full Body Undercoat Spray',
      'Premium Wax Polish & Teflon Protection'
    ]
  }
];

export const AVAILABLE_SPARE_PARTS = [
  { id: 'part-1', name: 'Premium Synthetic Engine Oil (1L)', price: 15 },
  { id: 'part-2', name: 'OEM Oil Filter', price: 12 },
  { id: 'part-3', name: 'Air Filter Element', price: 18 },
  { id: 'part-4', name: 'Front Brake Pads (Set)', price: 45 },
  { id: 'part-5', name: 'Spark Plug Platinum', price: 8 },
  { id: 'part-6', name: 'Wiper Blades (Pair)', price: 20 },
  { id: 'part-7', name: 'Halogen Headlight Bulb', price: 10 },
  { id: 'part-8', name: 'AC Cabin Filter', price: 22 }
];
