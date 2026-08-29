/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SERVICE_CENTERS } from './src/data';
import {
  User, Vehicle, Booking, AppNotification, Review, BookingStatus, SparePartUsed,
  SparePartInventory, Coupon, Membership, DocumentReminder, ExpenseLog
} from './src/types';
import { GoogleGenAI, Type } from '@google/genai';


async function startServer() {
  const app = express();
  app.use(express.json());

  // IN-MEMORY DATABASE SEED
  const users: User[] = [
    { id: 'usr-1', email: 'customer@service.com', name: 'John Doe', role: 'CUSTOMER', phone: '+1 (555) 019-2834' },
    { id: 'usr-2', email: 'mechanic@service.com', name: 'Alex Miller (Certified Mechanic)', role: 'MECHANIC', phone: '+1 (555) 042-9988' },
    { id: 'usr-3', email: 'admin@service.com', name: 'System Administrator', role: 'ADMIN', phone: '+1 (555) 010-1111' }
  ];

  const vehicles: Vehicle[] = [
    { id: 'veh-1', userId: 'usr-1', make: 'Tesla', model: 'Model 3', year: 2022, licensePlate: 'E-DRIVE9', type: 'Car' },
    { id: 'veh-2', userId: 'usr-1', make: 'Honda', model: 'CBR600RR', year: 2021, licensePlate: '99-WHEEL', type: 'Bike' }
  ];

  const bookings: Booking[] = [
    {
      id: 'bk-101',
      customerId: 'usr-1',
      customerName: 'John Doe',
      customerPhone: '+1 (555) 019-2834',
      vehicleId: 'veh-1',
      vehicleDetails: { make: 'Tesla', model: 'Model 3', licensePlate: 'E-DRIVE9' },
      serviceCenterId: 'sc-1',
      serviceCenterName: 'Metro Auto Care - Downtown',
      packageId: 'pkg-1',
      packageName: 'Basic General Service',
      packagePrice: 89,
      bookingDate: '2026-07-10',
      bookingTime: '10:00 AM',
      pickupRequested: true,
      pickupLocation: { address: '123 Main St, Tech City', lat: 12.9716, lng: 77.5946 },
      pickupCharge: 15,
      status: 'COMPLETED',
      repairImages: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400'],
      repairNotes: 'Completed general multi-point inspection. Topped up battery coolant and checked brakes. Everything looks clean and operational.',
      sparePartsUsed: [
        { name: 'Brake Fluid Clean', price: 12, quantity: 1 },
        { name: 'Cabin Air Filter', price: 25, quantity: 1 }
      ],
      paymentStatus: 'COMPLETED',
      paymentMethod: 'Razorpay',
      paymentId: 'pay_rzp_mock_982132',
      totalAmount: 141,
      invoiceId: 'INV-2026-101',
      createdAt: '2026-07-10T10:00:00.000Z'
    },
    {
      id: 'bk-102',
      customerId: 'usr-1',
      customerName: 'John Doe',
      customerPhone: '+1 (555) 019-2834',
      vehicleId: 'veh-2',
      vehicleDetails: { make: 'Honda', model: 'CBR600RR', licensePlate: '99-WHEEL' },
      serviceCenterId: 'sc-2',
      serviceCenterName: 'Speedy Repairs - North Branch',
      packageId: 'pkg-3',
      packageName: 'Comprehensive Repair Package',
      packagePrice: 249,
      bookingDate: '2026-07-16',
      bookingTime: '02:00 PM',
      pickupRequested: false,
      pickupCharge: 0,
      status: 'SERVICE_IN_PROGRESS',
      repairImages: [],
      sparePartsUsed: [
        { name: 'Front Brake Pads', price: 45, quantity: 1 },
        { name: 'Spark Plugs', price: 15, quantity: 4 }
      ],
      paymentStatus: 'PENDING',
      totalAmount: 354,
      createdAt: '2026-07-16T14:00:00.000Z'
    }
  ];

  const notifications: AppNotification[] = [
    {
      id: 'not-1',
      userId: 'usr-1',
      title: 'Welcome to Smart Service Hub!',
      message: 'Explore your digital garage, track live services, and use AI diagnostics.',
      date: new Date().toISOString(),
      read: false
    }
  ];

  const reviews: Review[] = [
    {
      id: 'rv-1',
      customerId: 'usr-1',
      customerName: 'John Doe',
      serviceCenterId: 'sc-1',
      rating: 5,
      comment: 'Super fast general service! The AI recommended booking times are very accurate and saved me 2 hours of waiting. Clean and professional mechanics!',
      date: '2026-07-11',
      sentiment: 'Positive',
      isFake: false
    },
    {
      id: 'rv-2',
      customerId: 'usr-4',
      customerName: 'Suresh Kumar',
      serviceCenterId: 'sc-2',
      rating: 1,
      comment: 'This shop does not exist. Extremely scammy service. They charged me and stole my spare parts.',
      date: '2026-07-12',
      sentiment: 'Negative',
      isFake: true
    }
  ];

  const upiSettings = {
    upiId: 'vehicleservicehub@okaxis',
    merchantName: 'Vehicle Service Hub Pvt Ltd'
  };

  // Enterprise Store/Database seed data
  const sparePartInventory: SparePartInventory[] = [
    { id: 'part-1', name: 'Front Brake Pads', stock: 45, price: 45, minStock: 10, category: 'Brakes' },
    { id: 'part-2', name: 'Rear Brake Pads', stock: 32, price: 40, minStock: 8, category: 'Brakes' },
    { id: 'part-3', name: 'Premium Synthetic Oil (1L)', stock: 80, price: 20, minStock: 15, category: 'Engine' },
    { id: 'part-4', name: 'Iridium Spark Plugs', stock: 120, price: 15, minStock: 20, category: 'Ignition' },
    { id: 'part-5', name: 'Cabin Air Filter', stock: 60, price: 25, minStock: 12, category: 'Filters' },
    { id: 'part-6', name: 'Battery Coolant (1L)', stock: 50, price: 18, minStock: 10, category: 'Cooling' },
    { id: 'part-7', name: 'LED Headlight Bulb', stock: 30, price: 35, minStock: 5, category: 'Electrical' },
    { id: 'part-8', name: 'High-Performance Tires', stock: 16, price: 110, minStock: 4, category: 'Wheels' }
  ];

  const coupons: Coupon[] = [
    { id: 'cp-1', code: 'FIRST50', discountPercentage: 15, expiryDate: '2026-12-31', active: true },
    { id: 'cp-2', code: 'SAVE15', discountPercentage: 15, expiryDate: '2026-09-30', active: true },
    { id: 'cp-3', code: 'AMCGOLD', discountPercentage: 20, expiryDate: '2026-12-31', active: true },
    { id: 'cp-4', code: 'FESTIVE25', discountPercentage: 25, expiryDate: '2026-10-31', active: true }
  ];

  const memberships: Membership[] = [
    { userId: 'usr-1', tier: 'Gold', loyaltyPoints: 350, referralCode: 'JOHNDOE777', referredCount: 2 }
  ];

  const documentReminders: DocumentReminder[] = [
    { id: 'rem-1', userId: 'usr-1', type: 'PUC', docName: 'Pollution Under Control Cert', expiryDate: '2026-08-15', status: 'Active' },
    { id: 'rem-2', userId: 'usr-1', type: 'Insurance', docName: 'Tata AIG Comprehensive Policy', expiryDate: '2026-11-20', status: 'Active' }
  ];

  const expenseLogs: ExpenseLog[] = [
    { id: 'exp-1', userId: 'usr-1', type: 'Fuel', amount: 55, date: '2026-07-02', description: 'Topped up premium gasoline at Shell', gallonsOrLiters: 45 },
    { id: 'exp-2', userId: 'usr-1', type: 'Fuel', amount: 48, date: '2026-07-09', description: 'Regular fuel top up', gallonsOrLiters: 40 },
    { id: 'exp-3', userId: 'usr-1', type: 'Maintenance', amount: 141, date: '2026-07-10', description: 'Booking payment for Basic General Service' }
  ];

  // Lazy initialize Gemini API Client safely
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (aiClient) return aiClient;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn("GEMINI_API_KEY not configured. AI requests will fallback to smart local rules.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      return aiClient;
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e);
      return null;
    }
  }


  // HELPER FOR NOTIFICATIONS
  const createNotification = (userId: string, title: string, message: string) => {
    notifications.unshift({
      id: `not-${Date.now()}`,
      userId,
      title,
      message,
      date: new Date().toISOString(),
      read: false
    });
  };

  // --- API ROUTING ---

  // Auth APIs
  app.post('/api/auth/register', (req, res) => {
    const { email, name, role, password, phone } = req.body;
    if (!email || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      role: role.toUpperCase() as any,
      phone: phone || ''
    };
    users.push(newUser);
    res.status(201).json({ user: newUser, token: `mock-jwt-token-${newUser.id}` });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ user, token: `mock-jwt-token-${user.id}` });
  });

  // Vehicle APIs
  app.get('/api/vehicles', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    const userVehicles = vehicles.filter(v => v.userId === userId);
    res.json(userVehicles);
  });

  app.post('/api/vehicles', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    const { make, model, year, licensePlate, type } = req.body;
    if (!make || !model || !year || !licensePlate || !type) {
      return res.status(400).json({ error: 'Missing required vehicle fields' });
    }
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      userId,
      make,
      model,
      year: parseInt(year),
      licensePlate,
      type
    };
    vehicles.push(newVehicle);
    res.status(201).json(newVehicle);
  });

  app.delete('/api/vehicles/:id', (req, res) => {
    const { id } = req.params;
    const index = vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      vehicles.splice(index, 1);
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Vehicle not found' });
  });

  // Service Center APIs
  app.get('/api/service-centers', (req, res) => {
    res.json(INITIAL_SERVICE_CENTERS);
  });

  // Booking APIs
  app.get('/api/bookings', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    const role = req.headers['x-user-role'] as string || 'CUSTOMER';

    if (role === 'ADMIN' || role === 'MECHANIC') {
      res.json(bookings);
    } else {
      const custBookings = bookings.filter(b => b.customerId === userId);
      res.json(custBookings);
    }
  });

  app.post('/api/bookings', (req, res) => {
    const customerId = req.headers['x-user-id'] as string || 'usr-1';
    const user = users.find(u => u.id === customerId);
    
    const {
      vehicleId,
      serviceCenterId,
      serviceCenterName,
      packageId,
      packageName,
      packagePrice,
      bookingDate,
      bookingTime,
      pickupRequested,
      pickupLocation,
      pickupCharge,
      totalAmount
    } = req.body;

    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      return res.status(400).json({ error: 'Invalid vehicle selected' });
    }

    const newBooking: Booking = {
      id: `bk-${Math.floor(100 + Math.random() * 900)}`,
      customerId,
      customerName: user ? user.name : 'Customer',
      customerPhone: user ? user.phone : '',
      vehicleId,
      vehicleDetails: {
        make: vehicle.make,
        model: vehicle.model,
        licensePlate: vehicle.licensePlate
      },
      serviceCenterId,
      serviceCenterName,
      packageId,
      packageName,
      packagePrice,
      bookingDate,
      bookingTime,
      pickupRequested,
      pickupLocation,
      pickupCharge: pickupCharge || 0,
      status: 'PENDING',
      repairImages: [],
      sparePartsUsed: [],
      paymentStatus: 'PENDING',
      totalAmount,
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);

    // Notify Customer and Admin
    createNotification(customerId, 'Booking Requested', `Your booking request for ${vehicle.make} ${vehicle.model} is pending confirmation.`);
    const adminUser = users.find(u => u.role === 'ADMIN');
    if (adminUser) {
      createNotification(adminUser.id, 'New Booking Received', `A new service booking request has been created by ${user?.name || 'Customer'}.`);
    }

    res.status(201).json(newBooking);
  });

  // Admin APIs: Assign Mechanic
  app.post('/api/bookings/:id/assign', (req, res) => {
    const { id } = req.params;
    const mechanicId = (req.body.mechanicId || req.query.mechanicId) as string;

    const booking = bookings.find(b => b.id === id);
    const mechanic = users.find(u => u.id === mechanicId && u.role === 'MECHANIC');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (!mechanic) {
      return res.status(400).json({ error: 'Invalid mechanic selected' });
    }

    booking.mechanicId = mechanic.id;
    booking.mechanicName = mechanic.name;
    booking.status = 'CONFIRMED';

    // Notify Customer and Mechanic
    createNotification(booking.customerId, 'Mechanic Assigned', `${mechanic.name} has been assigned to service your vehicle. Booking is confirmed.`);
    createNotification(mechanic.id, 'New Job Assigned', `You have been assigned to service a ${booking.vehicleDetails.make} ${booking.vehicleDetails.model}.`);

    res.json(booking);
  });

  // Status transitions
  app.post('/api/bookings/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status as BookingStatus;

    // Auto-assign calling mechanic if the booking currently has no mechanic
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;
    if (role === 'MECHANIC' && userId && !booking.mechanicId) {
      const mechanic = users.find(u => u.id === userId && u.role === 'MECHANIC');
      if (mechanic) {
        booking.mechanicId = mechanic.id;
        booking.mechanicName = mechanic.name;
      }
    }

    // Trigger Notification for the customer
    let msg = `Your vehicle service status has been updated to ${status.replace(/_/g, ' ')}.`;
    if (status === 'READY_FOR_DELIVERY') {
      msg = `Your vehicle is serviced, checked, and ready for pickup/delivery!`;
    }
    createNotification(booking.customerId, `Service Status: ${status.replace(/_/g, ' ')}`, msg);

    res.json(booking);
  });

  // Mechanic upload/notes API
  app.post('/api/bookings/:id/repair-details', (req, res) => {
    const { id } = req.params;
    const { repairNotes, sparePartsUsed, repairImages } = req.body;

    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Auto-assign calling mechanic if the booking currently has no mechanic
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;
    if (role === 'MECHANIC' && userId && !booking.mechanicId) {
      const mechanic = users.find(u => u.id === userId && u.role === 'MECHANIC');
      if (mechanic) {
        booking.mechanicId = mechanic.id;
        booking.mechanicName = mechanic.name;
      }
    }

    if (repairNotes !== undefined) booking.repairNotes = repairNotes;
    if (sparePartsUsed !== undefined) {
      booking.sparePartsUsed = sparePartsUsed;
      // Recalculate totalAmount
      const partsTotal = sparePartsUsed.reduce((sum: number, part: SparePartUsed) => sum + (part.price * part.quantity), 0);
      booking.totalAmount = booking.packagePrice + booking.pickupCharge + partsTotal;
    }
    if (repairImages !== undefined) {
      booking.repairImages = repairImages;
    }

    res.json(booking);
  });

  // Razorpay Simulation payment endpoint
  app.post('/api/bookings/:id/pay', (req, res) => {
    const { id } = req.params;
    const { paymentId } = req.body;

    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.paymentStatus = 'COMPLETED';
    booking.paymentId = paymentId || `pay_rzp_mock_${Math.floor(100000 + Math.random() * 900000)}`;
    booking.invoiceId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;

    createNotification(booking.customerId, 'Payment Successful', `Thank you! Your payment of $${booking.totalAmount} was processed successfully. Invoice ${booking.invoiceId} is ready.`);

    res.json(booking);
  });

  // UPI Payment endpoint (Customer submits UTR transaction ref)
  app.post('/api/bookings/:id/pay-upi', (req, res) => {
    const { id } = req.params;
    const { utr } = req.body;

    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.paymentStatus = 'PENDING_APPROVAL';
    booking.paymentMethod = 'UPI';
    booking.upiUtr = utr || `UTR-${Date.now().toString().slice(-6)}`;

    // Create notifications for Customer and Admin
    createNotification(booking.customerId, 'UPI Payment Submitted', `Your UPI payment with UTR ${booking.upiUtr} was submitted for approval.`);
    const adminUser = users.find(u => u.role === 'ADMIN');
    if (adminUser) {
      createNotification(adminUser.id, 'New UPI Approval Pending', `A new UPI payment request ($${booking.totalAmount}) is pending scanner review for booking #${id}.`);
    }

    res.json(booking);
  });

  // Admin approves UPI Payment
  app.post('/api/bookings/:id/approve-upi', (req, res) => {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.paymentStatus = 'COMPLETED';
    booking.paymentId = `pay_upi_${Math.floor(100000 + Math.random() * 900000)}`;
    booking.invoiceId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;

    createNotification(booking.customerId, 'UPI Payment Approved!', `Great news! Admin verified your UPI transfer. Invoice ${booking.invoiceId} is now available.`);

    res.json(booking);
  });

  // Admin rejects UPI Payment
  app.post('/api/bookings/:id/reject-upi', (req, res) => {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.paymentStatus = 'PENDING';
    booking.paymentMethod = undefined;
    booking.upiUtr = undefined;

    createNotification(booking.customerId, 'UPI Payment Declined', `Your UPI payment for booking #${id} was declined by Admin. Please re-submit with correct details or try another method.`);

    res.json(booking);
  });

  // UPI Settings APIs
  app.get('/api/upi-settings', (req, res) => {
    res.json(upiSettings);
  });

  app.post('/api/upi-settings', (req, res) => {
    const { upiId, merchantName } = req.body;
    if (upiId) upiSettings.upiId = upiId;
    if (merchantName) upiSettings.merchantName = merchantName;
    res.json(upiSettings);
  });

  // Review APIs
  app.get('/api/reviews', (req, res) => {
    res.json(reviews);
  });

  app.get('/api/reviews/:serviceCenterId', (req, res) => {
    const { serviceCenterId } = req.params;
    const filtered = reviews.filter(r => r.serviceCenterId === serviceCenterId);
    res.json(filtered);
  });

  app.post('/api/reviews', (req, res) => {
    const customerId = req.headers['x-user-id'] as string || 'usr-1';
    const user = users.find(u => u.id === customerId);
    const { serviceCenterId, rating, comment } = req.body;

    if (!serviceCenterId || !rating) {
      return res.status(400).json({ error: 'Missing review fields' });
    }

    const newReview: Review = {
      id: `rv-${Date.now()}`,
      customerId,
      customerName: user ? user.name : 'Customer',
      serviceCenterId,
      rating: parseInt(rating),
      comment: comment || '',
      date: new Date().toISOString().split('T')[0]
    };

    reviews.unshift(newReview);
    res.status(201).json(newReview);
  });

  // Notification APIs
  app.get('/api/notifications', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    const userNotif = notifications.filter(n => n.userId === userId);
    res.json(userNotif);
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Notification not found' });
  });

  // Admin and Mechanic List APIs
  app.get('/api/admin/mechanics', (req, res) => {
    res.json(users.filter(u => u.role === 'MECHANIC'));
  });

  app.get('/api/admin/stats', (req, res) => {
    const totalCustomers = users.filter(u => u.role === 'CUSTOMER').length;
    const totalMechanics = users.filter(u => u.role === 'MECHANIC').length;
    const activeBookings = bookings.filter(b => b.status !== 'COMPLETED').length;
    const completedServices = bookings.filter(b => b.status === 'COMPLETED').length;
    const totalRevenue = bookings.filter(b => b.paymentStatus === 'COMPLETED')
                                  .reduce((sum, b) => sum + b.totalAmount, 0);

    // Group bookings for analytics
    const statusBreakdown = {
      PENDING: bookings.filter(b => b.status === 'PENDING').length,
      CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
      SERVICE_IN_PROGRESS: bookings.filter(b => b.status === 'SERVICE_IN_PROGRESS').length,
      READY_FOR_DELIVERY: bookings.filter(b => b.status === 'READY_FOR_DELIVERY').length,
      COMPLETED: completedServices
    };

    res.json({
      totalCustomers,
      totalMechanics,
      activeBookings,
      completedServices,
      totalRevenue,
      statusBreakdown
    });
  });

  // --- ENTERPRISE AI & INDUSTRY FEATURES API ---

  // 1. AI Customer Support Chatbot with Multi-language Text & Voice Support (Telugu, Hindi, English)
  app.post('/api/ai/chat', async (req, res) => {
    const { message, history, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        let systemPrompt = "You are a highly helpful and friendly AI Customer Support Bot for the Smart Vehicle Service Hub platform. " +
          "You help customers book services, understand their vehicle health scores, predict maintenance needs, check coupon eligibility, and solve general troubleshooting queries. " +
          "Answer concisely and in a warm, welcoming style.";
        
        if (language === 'Telugu') {
          systemPrompt += " Respond entirely in Telugu language (using Telugu script). Ensure correct technical terms where needed.";
        } else if (language === 'Hindi') {
          systemPrompt += " Respond entirely in Hindi language (using Devanagari script). Ensure correct technical terms where needed.";
        }

        const model = "gemini-3.5-flash";
        // Create full chat context or send directly
        const formattedPrompt = history && history.length > 0 
          ? `Conversation history:\n${history.map((h: any) => `${h.role}: ${h.text}`).join('\n')}\nCustomer: ${message}\nAI:`
          : message;

        const response = await ai.models.generateContent({
          model,
          contents: formattedPrompt,
          config: { systemInstruction: systemPrompt }
        });

        return res.json({ reply: response.text });
      } catch (err: any) {
        console.error("Gemini Chatbot API error:", err);
      }
    }

    // Fallback rule-based intelligent support
    let reply = "Hello! I am your AI vehicle assistant. I can assist with service packages, AMC plans, and real-time maintenance updates. (Offline Mode)";
    const msgLower = message.toLowerCase();
    if (msgLower.includes('telugu')) {
      reply = "నమస్కారం! నేను మీ వాహన సహాయకుడిని. నేను మీకు ఎలా సహాయపడగలను? (ఆఫ్‌లైన్ మోడ్)";
    } else if (msgLower.includes('hindi')) {
      reply = "नमस्ते! मैं आपका वाहन सहायक हूँ। मैं आपकी क्या मदद कर सकता हूँ? (ऑफ़लाइन मोड)";
    } else if (msgLower.includes('book') || msgLower.includes('service')) {
      reply = "To book a service, head over to the 'Book Service' tab, select your vehicle, choose a service center nearest to you, pick an oil/brake package, and confirm!";
    } else if (msgLower.includes('coupon') || msgLower.includes('offer') || msgLower.includes('promo')) {
      reply = `Active promo codes: SAVE15 (15% off), FIRST50 (15% off first booking), or FESTIVE25 (25% off during peak seasons). Type them in at checkout!`;
    } else if (msgLower.includes('price') || msgLower.includes('cost')) {
      reply = "Basic General Services start at $89. Major repairs are $249, and battery coolants/fluids are calculated transparently with itemized spare parts listings.";
    } else if (msgLower.includes('health') || msgLower.includes('score')) {
      reply = "Your AI Vehicle Health Score evaluates your battery, braking system, filters, and engine wear based on vehicle age, mileage, and active repairs.";
    } else if (msgLower.includes('sos') || msgLower.includes('emergency') || msgLower.includes('breakdown')) {
      reply = "🚨 EMERGENCY BROKEN DOWN? Tap the red SOS Emergency Breakdown button on your dashboard to instantly dispatch a nearby towing service and alert our nearest branch.";
    }

    res.json({ reply });
  });

  // 2. AI-powered Predictive Maintenance & Vehicle Diagnostic Engine
  app.post('/api/ai/predictive-maintenance', async (req, res) => {
    const { vehicleId, mileage, year, make, model } = req.body;
    const currentYear = 2026;
    const carAge = currentYear - (parseInt(year) || 2022);
    const miles = parseInt(mileage) || 35000;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Analyze a ${year} ${make} ${model} with ${miles} miles. Provide:
1. An overall vehicle health score (0-100).
2. A list of 3 predictive issues with probabilities (e.g. Brake Wear, Spark Plug oxidation).
3. Recommended services.
4. Specific spare parts needed.
5. Crowd booking recommendation (best day/time).`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                healthScore: { type: Type.INTEGER },
                predictiveIssues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      component: { type: Type.STRING },
                      probability: { type: Type.INTEGER },
                      description: { type: Type.STRING }
                    },
                    required: ["component", "probability", "description"]
                  }
                },
                recommendedServices: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                partsRecommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      estimatedPrice: { type: Type.INTEGER }
                    },
                    required: ["name", "estimatedPrice"]
                  }
                },
                crowdAnalysis: { type: Type.STRING }
              },
              required: ["healthScore", "predictiveIssues", "recommendedServices", "partsRecommendations", "crowdAnalysis"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json(parsed);
        }
      } catch (err) {
        console.error("Predictive Maintenance AI failed, falling back to smart engine:", err);
      }
    }

    // High fidelity algorithmic fallback
    const healthScore = Math.max(35, Math.min(98, 100 - Math.round((miles / 3500) + (carAge * 4))));
    const predictiveIssues = [
      {
        component: "Brake Wear",
        probability: miles > 50000 ? 85 : miles > 25000 ? 60 : 25,
        description: `Based on your ${miles} miles, brake pad friction lining is likely worn down. Inspection highly recommended.`
      },
      {
        component: "Ignition / Spark Plugs",
        probability: miles > 60000 ? 90 : miles > 30000 ? 70 : 15,
        description: `Spark plug electrode gap expansion predicted. Service recommended to avoid engine misfires.`
      },
      {
        component: "Synthetic Cabin Air Filters",
        probability: carAge > 3 ? 95 : carAge > 1 ? 75 : 30,
        description: `Particulate accumulation blocks fresh airflow. Replacement recommended for pure air conditioning.`
      }
    ];

    const recommendedServices = [
      miles > 25000 ? "Front Brake Pad & Fluid Replacement" : "Basic Braking System Tuning",
      miles > 30000 ? "Iridium Spark Plugs Overhaul" : "General Spark Ignition Cleaning",
      "Cabin HEPA Filter Sanitization"
    ];

    const partsRecommendations = [
      { name: "Front Brake Pads", estimatedPrice: 45 },
      { name: "Cabin Air Filter", estimatedPrice: 25 },
      { name: "Iridium Spark Plugs", estimatedPrice: 15 }
    ];

    const crowdAnalysis = "Best booking time is Wednesday at 11:00 AM or Thursday at 2:30 PM (historically low-crowd slots with 80% faster turnarounds).";

    res.json({
      healthScore,
      predictiveIssues,
      recommendedServices,
      partsRecommendations,
      crowdAnalysis
    });
  });

  // 3. AI Sentiment Analysis & Review Fraud Checker
  app.post('/api/ai/analyze-review', async (req, res) => {
    const { comment, rating } = req.body;
    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Classify sentiment (Positive, Neutral, Negative) and check if this review is fake/fraudulent (isFake: true/false): "${comment}". Rating was ${rating}/5.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sentiment: { type: Type.STRING },
                isFake: { type: Type.BOOLEAN }
              },
              required: ["sentiment", "isFake"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json(parsed);
        }
      } catch (err) {
        console.error("AI Review analysis failed:", err);
      }
    }

    // Smart algorithmic fallback
    let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
    if (rating >= 4) sentiment = 'Positive';
    else if (rating <= 2) sentiment = 'Negative';

    // Basic fraud keywords checker
    const fakeKeywords = ['scam', 'fake website', 'does not exist', 'stole my money', 'stole my parts'];
    const isFake = fakeKeywords.some(kw => comment.toLowerCase().includes(kw)) || (rating === 1 && comment.length < 15);

    res.json({ sentiment, isFake });
  });

  // 4. AI Revenue & Demand Prediction Forecasting Dashboard
  app.get('/api/ai/demand-forecast', async (req, res) => {
    const totalRev = bookings.filter(b => b.paymentStatus === 'COMPLETED').reduce((sum, b) => sum + b.totalAmount, 0);
    const activeBk = bookings.length;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Forecast the monthly revenue and booking counts for the next 4 months given we have ${activeBk} bookings totaling $${totalRev} in current revenue. Output JSON with forecast array containing month, predictedBookings, and predictedRevenue.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                forecast: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      month: { type: Type.STRING },
                      predictedBookings: { type: Type.INTEGER },
                      predictedRevenue: { type: Type.INTEGER }
                    },
                    required: ["month", "predictedBookings", "predictedRevenue"]
                  }
                }
              },
              required: ["forecast"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json(parsed);
        }
      } catch (err) {
        console.error("AI Demand Forecasting failed:", err);
      }
    }

    // Smart mathematical fallback
    const forecast = [
      { month: 'August 2026', predictedBookings: activeBk + 8, predictedRevenue: totalRev + 1200 },
      { month: 'September 2026', predictedBookings: activeBk + 14, predictedRevenue: totalRev + 2450 },
      { month: 'October 2026', predictedBookings: activeBk + 22, predictedRevenue: totalRev + 3900 },
      { month: 'November 2026', predictedBookings: activeBk + 35, predictedRevenue: totalRev + 5800 }
    ];

    res.json({ forecast });
  });

  // 5. Promo Codes & Coupons API
  app.get('/api/coupons', (req, res) => {
    res.json(coupons);
  });

  app.post('/api/coupons', (req, res) => {
    const { code, discountPercentage, expiryDate } = req.body;
    if (!code || !discountPercentage || !expiryDate) {
      return res.status(400).json({ error: 'Missing required coupon fields' });
    }
    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: code.toUpperCase(),
      discountPercentage: parseInt(discountPercentage),
      expiryDate,
      active: true
    };
    coupons.push(newCoupon);
    res.status(201).json(newCoupon);
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Promo code required' });
    }
    const match = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!match) {
      return res.status(404).json({ error: 'Invalid or expired coupon' });
    }
    res.json(match);
  });

  // 6. Memberships & Loyalty Referral API
  app.get('/api/memberships', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    let match = memberships.find(m => m.userId === userId);
    if (!match) {
      match = { userId, tier: 'None', loyaltyPoints: 50, referralCode: `REF-${userId.toUpperCase()}`, referredCount: 0 };
      memberships.push(match);
    }
    res.json(match);
  });

  app.post('/api/memberships/referral', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    const { referralCode } = req.body;
    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    const host = memberships.find(m => m.referralCode === referralCode);
    if (!host) {
      return res.status(404).json({ error: 'Referral code not found' });
    }

    if (host.userId === userId) {
      return res.status(400).json({ error: 'You cannot use your own referral code' });
    }

    // Add referral bonus points to host and guest
    host.referredCount += 1;
    host.loyaltyPoints += 100;
    
    let guest = memberships.find(m => m.userId === userId);
    if (!guest) {
      guest = { userId, tier: 'Silver', loyaltyPoints: 150, referralCode: `REF-${userId.toUpperCase()}`, referredCount: 0 };
      memberships.push(guest);
    } else {
      guest.loyaltyPoints += 100;
    }

    createNotification(host.userId, 'Referral Bonus Received!', `Someone registered using your code ${referralCode}. 100 loyalty points added!`);
    createNotification(userId, 'Referral Applied', `Referral applied! 100 welcome loyalty points have been credited to your digital wallet.`);

    res.json({ success: true, guestLoyalty: guest.loyaltyPoints });
  });

  app.post('/api/memberships/upgrade', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    const { tier } = req.body;
    
    let member = memberships.find(m => m.userId === userId);
    if (!member) {
      member = { userId, tier: 'None', loyaltyPoints: 0, referralCode: `REF-${userId.toUpperCase()}`, referredCount: 0 };
      memberships.push(member);
    }

    member.tier = tier;
    createNotification(userId, `Membership Upgraded!`, `Congratulations, you are now a ${tier} tier member. Enjoy exclusive pickup priority and loyalty accelerators!`);
    res.json(member);
  });

  // 7. Digital Document Vault Reminders API
  app.get('/api/reminders', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    res.json(documentReminders.filter(r => r.userId === userId));
  });

  app.post('/api/reminders', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    const { type, docName, expiryDate } = req.body;
    if (!type || !docName || !expiryDate) {
      return res.status(400).json({ error: 'Missing required document fields' });
    }
    const newReminder: DocumentReminder = {
      id: `rem-${Date.now()}`,
      userId,
      type,
      docName,
      expiryDate,
      status: 'Active'
    };
    documentReminders.unshift(newReminder);
    res.status(201).json(newReminder);
  });

  app.delete('/api/reminders/:id', (req, res) => {
    const { id } = req.params;
    const idx = documentReminders.findIndex(r => r.id === id);
    if (idx !== -1) {
      documentReminders.splice(idx, 1);
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Reminder not found' });
  });

  // 8. Fuel & Maintenance Expenses API
  app.get('/api/expenses', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    res.json(expenseLogs.filter(e => e.userId === userId));
  });

  app.post('/api/expenses', (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'usr-1';
    const { type, amount, date, description, gallonsOrLiters } = req.body;
    if (!type || !amount || !date || !description) {
      return res.status(400).json({ error: 'Missing required expense fields' });
    }
    const newLog: ExpenseLog = {
      id: `exp-${Date.now()}`,
      userId,
      type,
      amount: parseFloat(amount),
      date,
      description,
      gallonsOrLiters: gallonsOrLiters ? parseFloat(gallonsOrLiters) : undefined
    };
    expenseLogs.unshift(newLog);
    res.status(201).json(newLog);
  });

  app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const idx = expenseLogs.findIndex(e => e.id === id);
    if (idx !== -1) {
      expenseLogs.splice(idx, 1);
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Expense log not found' });
  });

  // 9. Spare Parts Inventory Control API
  app.get('/api/inventory', (req, res) => {
    res.json(sparePartInventory);
  });

  app.post('/api/inventory/restock', (req, res) => {
    const { partId, quantity } = req.body;
    if (!partId || !quantity) {
      return res.status(400).json({ error: 'Part ID and restock quantity are required' });
    }
    const part = sparePartInventory.find(p => p.id === partId);
    if (!part) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    part.stock += parseInt(quantity);
    res.json(part);
  });

  // --- VITE MIDDLEWARE INTERFACE & SPA ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full stack Express+Vite dev server:', err);
});
