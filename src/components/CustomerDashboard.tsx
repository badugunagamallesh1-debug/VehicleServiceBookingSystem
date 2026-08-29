/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Car, Plus, Trash2, Calendar, MapPin, CheckCircle, 
  Clock, ShieldCheck, CreditCard, Download, Star, 
  MessageSquare, Bell, User, Navigation, ListTodo, Wrench, AlertCircle,
  Sparkles, Bot, Award, FileText, TrendingUp, Mic, Play, Square, Landmark,
  Ticket, ClipboardList, HelpCircle, Share2, ShieldAlert, Send, Eye, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Vehicle, ServiceCenter, ServicePackage, Booking, AppNotification, BookingStatus } from '../types';
import { SERVICE_PACKAGES, AVAILABLE_SPARE_PARTS } from '../data';
import MapContainer from './MapContainer';

interface CustomerDashboardProps {
  currentUser: { id: string; name: string; email: string; phone?: string };
}

export default function CustomerDashboard({ currentUser }: CustomerDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'vehicles' | 'book' | 'bookings' | 'notifications' | 'ratings' | 'ai' | 'loyalty' | 'documents' | 'expenses'>('book');
  
  // States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Enterprise Feature states
  const [membership, setMembership] = useState<any>({ tier: 'None', loyaltyPoints: 50, referralCode: 'JOHNDOE777', referredCount: 0 });
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // AI Chatbot States
  const [chatLanguage, setChatLanguage] = useState<'English' | 'Telugu' | 'Hindi'>('English');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Namaste! Welcome to Smart Service Hub. I am your 24/7 AI Diagnostic & Booking Companion. How can I assist you today?' }
  ]);
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI Predictive Maintenance & Health Score States
  const [selectedDiagVehicleId, setSelectedDiagVehicleId] = useState('');
  const [diagMileage, setDiagMileage] = useState('35000');
  const [diagResults, setDiagResults] = useState<any | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  // Emergency SOS Trigger States
  const [sosActive, setSosActive] = useState(false);
  const [sosStatus, setSosStatus] = useState('');

  // Referral input
  const [referralInputCode, setReferralInputCode] = useState('');
  const [referralSuccessMsg, setReferralSuccessMsg] = useState('');
  const [referralErrorMsg, setReferralErrorMsg] = useState('');

  // Document Vault Input States
  const [newDocType, setNewDocType] = useState<'PUC' | 'Insurance' | 'RC' | 'License'>('PUC');
  const [newDocName, setNewDocName] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');

  // Expense Logger Input States
  const [newExpType, setNewExpType] = useState<'Fuel' | 'Maintenance' | 'Other'>('Fuel');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpDate, setNewExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpQty, setNewExpQty] = useState('');
  
  // New Vehicle Form State
  const [vMake, setVMake] = useState('');
  const [vModel, setVModel] = useState('');
  const [vYear, setVYear] = useState('2022');
  const [vPlate, setVPlate] = useState('');
  const [vType, setVType] = useState<'Car' | 'Bike' | 'SUV' | 'Truck'>('Car');

  // Booking Wizard State
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00 AM');
  const [pickupRequested, setPickupRequested] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLoc, setPickupLoc] = useState<{ address: string; lat: number; lng: number } | null>(null);

  // Review states
  const [reviewCenterId, setReviewCenterId] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [allReviews, setAllReviews] = useState<any[]>([]);

  // UPI settings state
  const [upiSettings, setUpiSettings] = useState<{ upiId: string; merchantName: string }>({
    upiId: 'vehicleservicehub@okaxis',
    merchantName: 'Vehicle Service Hub Pvt Ltd'
  });

  // Track chosen payment mode for each booking (Razorpay vs UPI)
  const [paymentModes, setPaymentModes] = useState<Record<string, 'Razorpay' | 'UPI'>>({});
  // Track UTR input value for each booking
  const [utrInputs, setUtrInputs] = useState<Record<string, string>>({});

  // Payment simulated state
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

  // Fetch initial customer data
  const fetchData = async () => {
    try {
      const headers = { 'x-user-id': currentUser.id, 'x-user-role': 'CUSTOMER' };
      
      // Vehicles
      const vRes = await fetch('/api/vehicles', { headers });
      const vData = await vRes.json();
      setVehicles(vData);

      // Centers
      const cRes = await fetch('/api/service-centers');
      const cData = await cRes.json();
      setServiceCenters(cData);

      // Bookings
      const bRes = await fetch('/api/bookings', { headers });
      const bData = await bRes.json();
      setBookings(bData);

      // Notifications
      const nRes = await fetch('/api/notifications', { headers });
      const nData = await nRes.json();
      setNotifications(nData);

      // Reviews
      const rRes = await fetch('/api/reviews');
      const rData = await rRes.json();
      setAllReviews(rData);

      // UPI Settings
      const uRes = await fetch('/api/upi-settings');
      const uData = await uRes.json();
      setUpiSettings(uData);

      // Memberships
      const mRes = await fetch('/api/memberships', { headers });
      const mData = await mRes.json();
      setMembership(mData);

      // Document Reminders
      const remRes = await fetch('/api/reminders', { headers });
      const remData = await remRes.json();
      setReminders(remData);

      // Expense Logs
      const expRes = await fetch('/api/expenses', { headers });
      const expData = await expRes.json();
      setExpenses(expData);

      // Coupons
      const cpRes = await fetch('/api/coupons');
      const cpData = await cpRes.json();
      setCoupons(cpData);
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
    }
  };


  useEffect(() => {
    fetchData();
    // Poll data every 2 seconds for status changes
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vMake || !vModel || !vPlate) return;

    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          make: vMake,
          model: vModel,
          year: vYear,
          licensePlate: vPlate,
          type: vType
        })
      });
      if (res.ok) {
        setVMake('');
        setVModel('');
        setVPlate('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add vehicle', err);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to delete vehicle', err);
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedVehicleId || !selectedCenter || !selectedPackage || !bookingDate || !bookingTime) {
      alert('Please complete all booking selections.');
      return;
    }

    const pickupCharge = pickupRequested ? 15 : 0;
    const totalAmount = selectedPackage.price + pickupCharge;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          serviceCenterId: selectedCenter.id,
          serviceCenterName: selectedCenter.name,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          packagePrice: selectedPackage.price,
          bookingDate,
          bookingTime,
          pickupRequested,
          pickupLocation: pickupRequested ? pickupLoc : null,
          pickupCharge,
          totalAmount
        })
      });

      if (res.ok) {
        setBookingStep(5); // Success step
        fetchData();
        // Reset steps
        setSelectedVehicleId('');
        setSelectedCenter(null);
        setSelectedPackage(null);
        setPickupRequested(false);
        setPickupLoc(null);
      }
    } catch (err) {
      console.error('Failed to submit booking', err);
    }
  };

  // Simulated Razorpay checkout flow
  const handleRazorpayMockPay = async (bookingId: string, amount: number) => {
    setProcessingPaymentId(bookingId);
    try {
      // 1. Simulate API delay for Razorpay SDK order creation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Submit payment outcome
      const res = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          paymentId: `pay_rzp_${Math.floor(Math.random() * 900000 + 100000)}`
        })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Razorpay simulation failed', err);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Submit UPI Scanner payment with UTR reference ID
  const handleUpiPay = async (bookingId: string) => {
    const utr = utrInputs[bookingId] || '';
    if (!utr.trim()) {
      alert('Please enter a valid UPI Transaction Reference ID.');
      return;
    }
    setProcessingPaymentId(bookingId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await fetch(`/api/bookings/${bookingId}/pay-upi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ utr })
      });
      if (res.ok) {
        fetchData();
        // Clear input
        setUtrInputs(prev => ({ ...prev, [bookingId]: '' }));
      }
    } catch (err) {
      console.error('Failed to submit UPI payment', err);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Submit Feedback Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewCenterId || !reviewComment) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          serviceCenterId: reviewCenterId,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (res.ok) {
        setReviewComment('');
        alert('Thank you! Your feedback has been logged securely.');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to post review', err);
    }
  };

  // 1. AI Diagnostic & Voice Companion Handlers
  const handleSendAIChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatbotLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          language: chatLanguage,
          history: chatHistory
        })
      });
      const data = await res.json();
      const botReply = data.reply || "I'm sorry, I'm experiencing some connectivity issues. How can I help you otherwise?";
      
      setChatHistory(prev => [...prev, { role: 'model', text: botReply }]);
      
      // Auto Voice Speech Synthesis
      handleSpeakVoice(botReply);
    } catch (err) {
      console.error('AI chat failed', err);
    } finally {
      setChatbotLoading(false);
    }
  };

  const handleSpeakVoice = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // cancel current speech
    
    // Clean markdown characters from speaking text for beautiful clean audio
    const cleanText = text.replace(/[\*#_`\-]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Pick speech voice language matches
    if (chatLanguage === 'Telugu') {
      utterance.lang = 'te-IN';
    } else if (chatLanguage === 'Hindi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopVoice = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleRunAIDiagnostics = async () => {
    if (!selectedDiagVehicleId) return;
    setDiagLoading(true);
    
    const v = vehicles.find(veh => veh.id === selectedDiagVehicleId);
    if (!v) return;

    try {
      const res = await fetch('/api/ai/predictive-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: v.id,
          mileage: diagMileage,
          year: v.year,
          make: v.make,
          model: v.model
        })
      });
      const data = await res.json();
      setDiagResults(data);
    } catch (err) {
      console.error('AI Diagnostics failed', err);
    } finally {
      setDiagLoading(false);
    }
  };

  // 2. Emergency Breakdown Dispatcher
  const handleTriggerSOS = async () => {
    setSosActive(true);
    setSosStatus('Scanning nearest service branches...');
    
    try {
      await new Promise(r => setTimeout(r, 1500));
      setSosStatus('Nearest branch found! Dispatching specialized Tow Truck (G-TOW-28)...');
      
      await new Promise(r => setTimeout(r, 1500));
      setSosStatus('Tow truck dispatched! ETA: 12 minutes. Real-time satellite channel established.');
      
      // Auto create notification and emergency booking
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          vehicleId: vehicles[0]?.id || 'veh-1',
          serviceCenterId: serviceCenters[0]?.id || 'sc-1',
          packageId: 'pkg-3', // comprehensive emergency repair
          bookingDate: new Date().toISOString().split('T')[0],
          bookingTime: 'EMERGENCY SOS',
          pickupRequested: true,
          pickupAddress: 'SOS Highway Sector 42'
        })
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('SOS request failed', e);
    }
  };

  const handleCancelSOS = () => {
    setSosActive(false);
    setSosStatus('');
  };

  // 3. Referral & Loyalty Handlers
  const handleApplyReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setReferralSuccessMsg('');
    setReferralErrorMsg('');
    if (!referralInputCode.trim()) return;

    try {
      const res = await fetch('/api/memberships/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ referralCode: referralInputCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setReferralSuccessMsg('Referral validated successfully! 100 bonus loyalty points credited.');
        setReferralInputCode('');
        fetchData();
      } else {
        setReferralErrorMsg(data.error || 'Referral code validation failed.');
      }
    } catch (err) {
      setReferralErrorMsg('Failed to process referral code.');
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied code "${code}" to clipboard! Use at checkout for dynamic discount.`);
  };

  // 4. Document Vault Handlers
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocExpiry) return;

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          type: newDocType,
          docName: newDocName,
          expiryDate: newDocExpiry
        })
      });
      if (res.ok) {
        setNewDocName('');
        setNewDocExpiry('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to save document', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  // 5. Expense Logger Handlers
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpAmount || !newExpDesc) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          type: newExpType,
          amount: newExpAmount,
          date: newExpDate,
          description: newExpDesc,
          gallonsOrLiters: newExpQty || undefined
        })
      });
      if (res.ok) {
        setNewExpAmount('');
        setNewExpDesc('');
        setNewExpQty('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add expense log', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to delete expense log', err);
    }
  };

  // Read notification
  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id }
      });
      fetchData();
    } catch (err) {
      console.error('Failed to read notification', err);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const map: Record<BookingStatus, { bg: string, text: string, label: string }> = {
      PENDING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Pending Approval' },
      CONFIRMED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Confirmed' },
      VEHICLE_RECEIVED: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', label: 'Vehicle Received' },
      INSPECTION: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Under Inspection' },
      SERVICE_IN_PROGRESS: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', label: 'Service In Progress' },
      WAITING_FOR_SPARE_PARTS: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Awaiting Spares' },
      QUALITY_CHECK: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', label: 'Quality Check' },
      READY_FOR_DELIVERY: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Ready for Delivery' },
      COMPLETED: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', label: 'Completed' },
    };
    const c = map[status] || { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-8" id="customer-dashboard-root">
      {/* SOS Active Emergency Response Tracking Overlay */}
      {sosActive && (
        <div className="max-w-3xl mx-auto bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 relative overflow-hidden animate-pulse">
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-rose-500"></div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-rose-500 text-white rounded-2xl">
              <ShieldAlert className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-800 uppercase tracking-wide">🚨 Emergency SOS Dispatch Active</h4>
              <p className="text-xs font-semibold text-rose-700 mt-1">{sosStatus}</p>
              <div className="flex items-center space-x-2 mt-2 text-[10px] font-mono text-rose-500">
                <span className="bg-rose-100 px-2 py-0.5 rounded">VEHICLE LOCATION PINPOINTED</span>
                <span className="bg-rose-100 px-2 py-0.5 rounded">TOWING RESPONDER ASSIGNED</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCancelSOS}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg cursor-pointer transition-colors"
          >
            Cancel Alarm
          </button>
        </div>
      )}

      {/* Dual Row Quick Navigation Cards */}
      <div className="space-y-3 max-w-xl mx-auto" id="dashboard-tab-navigation">
        {/* Row 1: Core Service Ops */}
        <div className="flex bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-1">
          {[
            { id: 'book', label: 'Book Service', icon: Calendar },
            { id: 'bookings', label: 'Track Repairs', icon: Clock },
            { id: 'vehicles', label: 'Garage', icon: Car },
            { id: 'ratings', label: 'Reviews Feed', icon: Star },
            { id: 'notifications', label: 'Alerts', icon: Bell, count: notifications.filter(n => !n.read).length }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-black relative transition-all cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2: Advanced AI & Smart Wallets */}
        <div className="flex bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden p-1">
          {[
            { id: 'ai', label: 'AI Diagnostic', icon: Sparkles, premium: true },
            { id: 'loyalty', label: 'Loyalty & AMC', icon: Award },
            { id: 'documents', label: 'Document Vault', icon: FileText },
            { id: 'expenses', label: 'Expense Logs', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-black relative transition-all cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4 mb-1" />
                  {tab.premium && (
                    <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                  )}
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- WORKFLOW: BOOK A SERVICE --- */}
      {activeSubTab === 'book' && (
        <div className="space-y-6">
          {/* Booking Progress indicator */}
          <div className="flex items-center justify-between max-w-xl mx-auto px-4">
            {[
              { step: 1, label: 'Vehicle' },
              { step: 2, label: 'Branch Location' },
              { step: 3, label: 'Service Package' },
              { step: 4, label: 'Date & Time' },
              { step: 5, label: 'Booked!' }
            ].map((node) => (
              <React.Fragment key={node.step}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    bookingStep === node.step
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                      : bookingStep > node.step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {bookingStep > node.step ? '✓' : node.step}
                  </div>
                  <span className="text-[10px] mt-1 font-bold text-slate-500">{node.label}</span>
                </div>
                {node.step < 5 && (
                  <div className={`flex-1 h-0.5 mx-2 ${bookingStep > node.step ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto">
            {/* STEP 1: SELECT VEHICLE */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-800">Choose Your Vehicle</h3>
                  <p className="text-xs text-slate-500 mt-1">Select one of your registered garage vehicles to schedule service.</p>
                </div>

                {vehicles.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No vehicles registered. Go to your Garage tab first!</p>
                    <button
                      onClick={() => setActiveSubTab('vehicles')}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                    >
                      Add Vehicle
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-3.5 ${
                          selectedVehicleId === v.id
                            ? 'border-blue-500 bg-blue-50/50'
                            : 'border-slate-150 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="bg-blue-600 text-white p-2.5 rounded-xl">
                          <Car className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-slate-800">{v.make} {v.model}</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Plate: {v.licensePlate} • Year: {v.year}</p>
                        </div>
                        {selectedVehicleId === v.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    disabled={!selectedVehicleId}
                    onClick={() => setBookingStep(2)}
                    className="px-6 py-2 bg-blue-600 disabled:opacity-40 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Select Location & Next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT LOCATION ON MAP */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-800">Select Nearby Service Center</h3>
                  <p className="text-xs text-slate-500 mt-1">Choose a location on the map. We show rating, distance and travel matrices.</p>
                </div>

                <div className="h-[400px]">
                  <MapContainer
                    serviceCenters={serviceCenters}
                    selectedCenter={selectedCenter}
                    onSelectCenter={(center) => setSelectedCenter(center)}
                    mode="browse"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-bold"
                  >
                    Back
                  </button>
                  <button
                    disabled={!selectedCenter}
                    onClick={() => setBookingStep(3)}
                    className="px-6 py-2 bg-blue-600 disabled:opacity-40 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Choose Service Package
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SELECT SERVICE PACKAGE */}
            {bookingStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-800">Choose Service Package</h3>
                  <p className="text-xs text-slate-500 mt-1">Itemized upfront bundles with parts inclusion list.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SERVICE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-5 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/20'
                            : 'border-slate-150 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{pkg.name}</h4>
                            {isSelected && <CheckCircle className="w-4.5 h-4.5 text-blue-600 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{pkg.description}</p>
                          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                            {pkg.features.map((f, idx) => (
                              <div key={idx} className="flex items-center space-x-1.5 text-[9px] text-slate-600">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4 flex justify-between items-baseline">
                          <span className="text-slate-400 text-[10px] font-semibold">{pkg.estimatedTime}</span>
                          <span className="text-lg font-black text-blue-600 font-mono">₹{pkg.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-bold"
                  >
                    Back
                  </button>
                  <button
                    disabled={!selectedPackage}
                    onClick={() => setBookingStep(4)}
                    className="px-6 py-2 bg-blue-600 disabled:opacity-40 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Schedule & Pickup
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DATE/TIME & OPTIONAL PICKUP LOCATION */}
            {bookingStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-800">Schedule & Pickup Options</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure date and time of arrival. Optionally request door-to-door vehicle pickup.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-800 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Window</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-800 rounded-xl focus:outline-none"
                    >
                      <option>09:00 AM</option>
                      <option>11:30 AM</option>
                      <option>02:00 PM</option>
                      <option>04:30 PM</option>
                    </select>
                  </div>
                </div>

                {/* Pickup Toggle */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>Optional Pickup & Drop Logistics</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Let an agent safely retrieve your vehicle from your coordinates. (+₹15.00)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPickupRequested(!pickupRequested)}
                      className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        pickupRequested ? 'bg-rose-500 text-white' : 'bg-slate-150 text-slate-600'
                      }`}
                    >
                      {pickupRequested ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {pickupRequested && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Select Pickup Point on Map</label>
                        <div className="h-[250px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <MapContainer
                            serviceCenters={selectedCenter ? [selectedCenter] : []}
                            selectedCenter={selectedCenter}
                            mode="select-pickup"
                            onSelectPickupLocation={(loc) => {
                              setPickupLoc(loc);
                              setPickupAddress(loc.address);
                            }}
                          />
                        </div>
                      </div>

                      {pickupLoc && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 text-xs text-slate-600">
                          📍 Confirmed: <strong>{pickupLoc.address}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Booking summary breakdown */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Final Price Breakdown</h4>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{selectedPackage?.name}</span>
                    <span className="font-mono font-bold">₹{selectedPackage?.price}</span>
                  </div>
                  {pickupRequested && (
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Valet Pickup Logistics</span>
                      <span className="font-mono font-bold">₹15.00</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-800">
                    <span>Total Estimated Amount</span>
                    <span className="font-mono text-blue-600">₹{(selectedPackage ? selectedPackage.price + (pickupRequested ? 15 : 0) : 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setBookingStep(3)}
                    className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-bold"
                  >
                    Back
                  </button>
                  <button
                    disabled={!bookingDate || (pickupRequested && !pickupLoc)}
                    onClick={handleCreateBooking}
                    className="px-6 py-2.5 bg-blue-600 disabled:opacity-40 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm Booking Request
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: BOOKING SUCCESS */}
            {bookingStep === 5 && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Booking Order Created Successfully!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your request is queued for approval. A certified mechanic will be assigned shortly. You can track actual progress live in your tracking terminal!
                </p>
                <div className="pt-4 flex justify-center space-x-3">
                  <button
                    onClick={() => { setBookingStep(1); setActiveSubTab('bookings'); }}
                    className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Track in Repairs Terminal
                  </button>
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Book Another Job
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TRACK REPAIRS & PAYMENTS TERMINAL --- */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-800">Active Service Tracker</h2>
            <p className="text-xs text-slate-400">View diagnostics, status milestones, spare parts logs, and process checkout invoices.</p>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No booking records found. Start by booking a service!</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  {/* Card Header */}
                  <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 text-white p-2 rounded-xl">
                        <Wrench className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-black text-slate-800">Job: {booking.id}</h4>
                          <span className="text-[10px] font-bold text-slate-400">Created {new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">{booking.packageName} for {booking.vehicleDetails.make} {booking.vehicleDetails.model}</p>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Step Visualizer */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Milestone Progress</h4>
                      
                      <div className="space-y-3.5 relative pl-5 border-l border-slate-150">
                        {[
                          { key: 'PENDING', label: 'Booking Placed', desc: 'Awaiting admin approval' },
                          { key: 'CONFIRMED', label: 'Mechanic Dispatched', desc: booking.mechanicName || 'Assigning mechanic' },
                          { key: 'SERVICE_IN_PROGRESS', label: 'Repair & Diagnostics', desc: 'Work in active progress' },
                          { key: 'READY_FOR_DELIVERY', label: 'Quality Check & Ready', desc: 'Cleaned, serviced, and detailed' },
                          { key: 'COMPLETED', label: 'Service Completed', desc: 'Payment received & completed' }
                        ].map((m, idx) => {
                          const statuses = ['PENDING', 'CONFIRMED', 'VEHICLE_RECEIVED', 'INSPECTION', 'SERVICE_IN_PROGRESS', 'WAITING_FOR_SPARE_PARTS', 'QUALITY_CHECK', 'READY_FOR_DELIVERY', 'COMPLETED'];
                          const currentIdx = statuses.indexOf(booking.status);
                          const stepIdx = statuses.indexOf(m.key as any);
                          const isDone = currentIdx >= stepIdx;

                          return (
                            <div key={idx} className="relative">
                              <span className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                                isDone 
                                  ? 'bg-emerald-500 border-emerald-500 shadow-inner' 
                                  : 'bg-white border-slate-300'
                              }`}></span>
                              <div>
                                <h5 className={`text-xs font-bold ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                  {m.label}
                                </h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right side details, spare parts & Payment info */}
                    <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Service Details & Spares</h4>
                        
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <p>Branch: <strong>{booking.serviceCenterName}</strong></p>
                          <p>Schedule: <strong>{booking.bookingDate} @ {booking.bookingTime}</strong></p>
                          {booking.repairNotes && (
                            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 mt-2">
                              🔧 <strong className="text-slate-700">Mechanic Notes:</strong> {booking.repairNotes}
                            </div>
                          )}
                        </div>

                        {/* Spare Parts Logged */}
                        {booking.sparePartsUsed.length > 0 && (
                          <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-150">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Logged Spare Parts</h5>
                            <div className="space-y-1 text-xs">
                              {booking.sparePartsUsed.map((p, idx) => (
                                <div key={idx} className="flex justify-between text-slate-600">
                                  <span>{p.name} (x{p.quantity})</span>
                                  <span className="font-mono">₹{p.price * p.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Checkout, PDF, Payments block */}
                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        <div className="flex justify-between items-baseline text-sm">
                          <span className="font-bold text-slate-700">Total Bill Amount</span>
                          <span className="text-lg font-black font-mono text-blue-600">₹{booking.totalAmount}</span>
                        </div>

                        {booking.paymentStatus === 'PENDING' ? (
                          <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => setPaymentModes(prev => ({ ...prev, [booking.id]: 'Razorpay' }))}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer text-center border transition-all ${
                                  (paymentModes[booking.id] || 'Razorpay') === 'Razorpay'
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                💳 Card / Netbanking
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentModes(prev => ({ ...prev, [booking.id]: 'UPI' }))}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer text-center border transition-all ${
                                  paymentModes[booking.id] === 'UPI'
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                📱 UPI Scan & Pay
                              </button>
                            </div>

                            {(paymentModes[booking.id] || 'Razorpay') === 'Razorpay' ? (
                              <button
                                onClick={() => handleRazorpayMockPay(booking.id, booking.totalAmount)}
                                disabled={processingPaymentId === booking.id}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow cursor-pointer"
                              >
                                <CreditCard className="w-4 h-4" />
                                <span>{processingPaymentId === booking.id ? 'Loading Razorpay SDK...' : 'Pay Online (Razorpay)'}</span>
                              </button>
                            ) : (
                              <div className="space-y-3.5 pt-1">
                                <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col items-center text-center relative overflow-hidden">
                                  {/* Laser Scanning Animation Effect */}
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/80 animate-bounce opacity-80" />
                                  
                                  {/* Real scannable UPI QR Code Image */}
                                  <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-center relative shadow-inner">
                                    <img
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                        `upi://pay?pa=${upiSettings.upiId}&pn=${upiSettings.merchantName}&am=${(booking.totalAmount * 83).toFixed(0)}&cu=INR`
                                      )}`}
                                      alt="UPI Merchant QR Code"
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-contain"
                                    />
                                  </div>

                                  <div className="mt-2 space-y-0.5">
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{upiSettings.merchantName}</p>
                                    <p className="text-[9px] font-mono text-blue-600 font-bold">{upiSettings.upiId}</p>
                                    <p className="text-[11px] font-mono font-bold text-slate-700 mt-1">
                                      Amount: <span className="text-emerald-600 font-black">₹{booking.totalAmount.toFixed(2)}</span>
                                    </p>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wider mt-1.5">
                                      ✓ Scannable UPI link
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Transaction UTR Ref (12 Digits)</label>
                                  <input
                                    type="text"
                                    maxLength={24}
                                    placeholder="Enter UTR reference e.g. 99281541"
                                    value={utrInputs[booking.id] || ''}
                                    onChange={(e) => setUtrInputs(prev => ({ ...prev, [booking.id]: e.target.value }))}
                                    className="w-full p-2 bg-white border border-slate-250 text-xs rounded-lg font-mono focus:outline-none focus:border-blue-500 text-slate-800"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleUpiPay(booking.id)}
                                  disabled={processingPaymentId === booking.id || !(utrInputs[booking.id] || '').trim()}
                                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                                >
                                  <span>Submit UPI Scanner payment</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : booking.paymentStatus === 'PENDING_APPROVAL' ? (
                          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs space-y-1">
                            <div className="font-bold flex items-center space-x-1.5">
                              <span className="animate-pulse text-sm">⏳</span>
                              <span>UPI Verification Pending Approval</span>
                            </div>
                            <p className="text-[10px] text-amber-700 leading-relaxed">
                              Your UPI payment request is in queue. Admin desk is verifying UTR Reference: <strong className="font-mono text-slate-900 bg-amber-100/60 px-1 rounded">{booking.upiUtr}</strong>. Invoice will unlock once confirmed.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2 rounded-lg text-center text-xs font-bold flex items-center justify-center space-x-1.5">
                              <CheckCircle className="w-4 h-4" />
                              <span>Paid Securely via {booking.paymentMethod === 'UPI' ? 'Verified UPI Scan' : 'Razorpay'}</span>
                            </div>
                            
                            {/* Download Invoice Button */}
                            <a
                              href={`data:text/plain;charset=utf-8,${encodeURIComponent(`
=========================================
      VEHICLE SERVICE HUB INVOICE
=========================================
Invoice ID: ${booking.invoiceId}
Booking Job ID: ${booking.id}
Vehicle: ${booking.vehicleDetails.make} ${booking.vehicleDetails.model}
License Plate: ${booking.vehicleDetails.licensePlate}
Client: ${currentUser.name}

DETAILS:
-----------------------------------------
Package: ${booking.packageName}   ₹${booking.packagePrice}
Pickup: ${booking.pickupRequested ? 'Requested (₹15.00)' : 'N/A'}
Spare Parts:
${booking.sparePartsUsed.map(p => ` - ${p.name} (x${p.quantity}): ₹${p.price * p.quantity}`).join('\n')}

-----------------------------------------
Total Paid: ₹${booking.totalAmount}

Payment Method: ${booking.paymentMethod || 'Razorpay'}
Payment Transaction ID: ${booking.paymentId}
${booking.upiUtr ? `UPI Transaction Reference UTR: ${booking.upiUtr}\n` : ''}Status: COMPLETE (Processed & Confirmed)
Thank you for booking with Vehicle Service Hub!
                              `)}`}
                              download={`invoice_${booking.id}.txt`}
                              className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm text-center"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Bill PDF / Invoice</span>
                            </a>

                            {/* Write Review Block if service center is not reviewed */}
                            <button
                              onClick={() => setReviewCenterId(booking.serviceCenterId)}
                              className="w-full py-1.5 border border-dashed border-blue-200 hover:bg-blue-50/50 text-blue-700 text-[10px] font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Write Branch Review</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Feedback Form drawer */}
                  {reviewCenterId === booking.serviceCenterId && (
                    <form onSubmit={handleSubmitReview} className="bg-slate-50 border-t border-slate-100 p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-800">Submit Branch Review & Star Rating</h4>
                        <button 
                          type="button" 
                          onClick={() => setReviewCenterId('')}
                          className="text-[10px] text-slate-400 font-bold hover:text-slate-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="flex items-center space-x-3">
                        <label className="text-xs text-slate-600 font-semibold">Star Rating:</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(e.target.value)}
                          className="p-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                        >
                          <option>5</option>
                          <option>4</option>
                          <option>3</option>
                          <option>2</option>
                          <option>1</option>
                        </select>
                        <div className="flex text-amber-400">
                          {[...Array(parseInt(reviewRating))].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>

                      <div>
                        <textarea
                          placeholder="Tell us about your diagnostic service or repair experience..."
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- GARAGE VEHICLE MANAGEMENT --- */}
      {activeSubTab === 'vehicles' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add vehicle form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Add New Vehicle</h3>
              
              <form onSubmit={handleAddVehicle} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tesla, Toyota, Honda"
                    value={vMake}
                    onChange={(e) => setVMake(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 text-xs rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Model 3, Prius, CBR"
                    value={vModel}
                    onChange={(e) => setVModel(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 text-xs rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Build Year</label>
                    <input
                      type="number"
                      required
                      placeholder="2022"
                      value={vYear}
                      onChange={(e) => setVYear(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 text-xs rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Type</label>
                    <select
                      value={vType}
                      onChange={(e) => setVType(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 text-xs rounded-lg"
                    >
                      <option>Car</option>
                      <option>Bike</option>
                      <option>SUV</option>
                      <option>Truck</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">License Plate Number</label>
                  <input
                    type="text"
                    required
                    placeholder="E-DRIVE9"
                    value={vPlate}
                    onChange={(e) => setVPlate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 text-xs rounded-lg font-mono font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Vehicle</span>
                </button>
              </form>
            </div>

            {/* Garage vehicle list */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">My Registered Garage</h3>
              
              {vehicles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <Car className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Your garage is currently empty. Add your first vehicle on the left!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicles.map((v) => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{v.make} {v.model}</h4>
                          <div className="space-y-0.5 text-[10px] text-slate-500 mt-1">
                            <p>Build Year: <strong className="text-slate-700">{v.year}</strong></p>
                            <p>License: <strong className="text-slate-700 font-mono">{v.licensePlate}</strong></p>
                            <p>Type: <strong className="text-slate-700">{v.type}</strong></p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATIONS --- */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-4 max-w-xl mx-auto">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Alert Notifications Hub</h3>
          
          {notifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Bell className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">All caught up! No recent alerts.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markNotificationRead(n.id)}
                  className={`p-4 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${
                    n.read 
                      ? 'bg-slate-50 border-slate-200 opacity-60' 
                      : 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-500/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-300' : 'bg-blue-500'}`}></span>
                  <div className="flex-1">
                    <h4 className={`text-xs font-black ${n.read ? 'text-slate-700' : 'text-slate-800'}`}>{n.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">{new Date(n.date).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- RATINGS & CUSTOMER FEEDBACK TAB --- */}
      {activeSubTab === 'ratings' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-800">Branch Ratings & Experience Feedback</h2>
            <p className="text-xs text-slate-400">Share your service diagnostic experience or browse verified customer ratings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Submit New Rating Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm self-start">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span>Rate Your Branch</span>
              </h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!reviewCenterId) {
                    alert('Please select a service center to rate.');
                    return;
                  }
                  try {
                    const res = await fetch('/api/reviews', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': currentUser.id
                      },
                      body: JSON.stringify({
                        serviceCenterId: reviewCenterId,
                        rating: reviewRating,
                        comment: reviewComment
                      })
                    });
                    if (res.ok) {
                      setReviewComment('');
                      alert('Thank you! Your feedback has been submitted successfully.');
                      fetchData();
                    }
                  } catch (err) {
                    console.error('Failed to submit review:', err);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Service Branch</label>
                  <select
                    required
                    value={reviewCenterId}
                    onChange={(e) => setReviewCenterId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="">-- Choose Branch --</option>
                    {serviceCenters.map((center) => (
                      <option key={center.id} value={center.id}>{center.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Star Rating Score</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setReviewRating(String(score))}
                        className="focus:outline-none cursor-pointer p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            score <= parseInt(reviewRating)
                              ? 'text-amber-400 fill-current'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-500 ml-1">({reviewRating} / 5)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Detailed Comment</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the quality of service, mechanic speed, repair quality, or vehicle handoff..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Submit Rating Feedback</span>
                </button>
              </form>
            </div>

            {/* Verified Ratings Feed */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>Verified Client Reviews ({allReviews.length})</span>
              </h3>

              {allReviews.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <Star className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No reviews logged yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allReviews.map((r) => {
                    const center = serviceCenters.find(c => c.id === r.serviceCenterId);
                    return (
                      <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-slate-800">{r.customerName}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Rated: <strong>{center ? center.name : 'Service Center'}</strong>
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{r.date}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${
                                idx < r.rating ? 'text-amber-400 fill-current' : 'text-slate-150'
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-xs text-slate-600 italic leading-relaxed pt-1">
                          "{r.comment}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- WORKFLOW: AI DIAGNOSTIC & SUPPORT BOT --- */}
      {activeSubTab === 'ai' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Section Heading */}
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-800 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>AI Intelligent Support Suite</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Predictive maintenance scheduling, custom diagnostics, and voice-enabled multi-language assistant.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Live Vehicle Health Score Analyzer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-500" />
                <span>AI Predictive Maintenance</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Garage Vehicle</label>
                  <select
                    value={selectedDiagVehicleId}
                    onChange={(e) => setSelectedDiagVehicleId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase mb-1">
                    <span>Odometer Reading</span>
                    <span className="text-blue-600">{parseInt(diagMileage).toLocaleString()} miles</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="150000"
                    step="500"
                    value={diagMileage}
                    onChange={(e) => setDiagMileage(e.target.value)}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <button
                  disabled={!selectedDiagVehicleId || diagLoading}
                  onClick={handleRunAIDiagnostics}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: diagLoading ? '2s' : '0s' }} />
                  <span>{diagLoading ? 'Computing Diagnostic vectors...' : 'Initialize AI Vehicle Health Scan'}</span>
                </button>
              </div>

              {/* Scan Results */}
              {diagResults ? (
                <div className="border-t border-slate-100 pt-5 space-y-4 animate-fadeIn">
                  {/* Health Score Gauge */}
                  <div className="flex items-center space-x-4">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={diagResults.healthScore > 80 ? '#10b981' : diagResults.healthScore > 50 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={175}
                          strokeDashoffset={175 - (175 * diagResults.healthScore) / 100}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute text-xs font-black text-slate-800">{diagResults.healthScore}%</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">AI Vehicle Health Score</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {diagResults.healthScore > 80
                          ? 'Excellent. Maintain schedule.'
                          : diagResults.healthScore > 50
                          ? 'Moderate. Minor warning indicators.'
                          : 'Critical status. Prompt checkup advised.'}
                      </p>
                    </div>
                  </div>

                  {/* Component Probabilities */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Predictive Wear Warnings</h4>
                    {diagResults.predictiveIssues?.map((issue: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-700">{issue.component}</span>
                          <span className={issue.probability > 75 ? 'text-rose-600 font-mono' : issue.probability > 45 ? 'text-amber-600 font-mono' : 'text-emerald-600 font-mono'}>
                            {issue.probability}% wear prob.
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${issue.probability}%` }}
                            className={`h-full rounded-full ${
                              issue.probability > 75 ? 'bg-rose-500' : issue.probability > 45 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          ></div>
                        </div>
                        <p className="text-[9px] text-slate-400 italic leading-snug">{issue.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Parts Needed */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-indigo-500" />
                      <span>Recommended Spare Parts</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                      {diagResults.partsRecommendations?.map((part: any, idx: number) => (
                        <div key={idx} className="bg-white px-2 py-1.5 rounded border border-slate-200 flex justify-between font-medium">
                          <span>{part.name}</span>
                          <strong className="text-slate-800">₹{part.estimatedPrice}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking slot recommendation */}
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-start space-x-2.5">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[10px] font-black text-blue-800 uppercase">AI Booking Slot Recommendation</h5>
                      <p className="text-[10px] text-blue-700 leading-snug mt-0.5">{diagResults.crowdAnalysis}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <Bot className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
                  <p className="text-xs text-slate-500 font-medium">No active diagnostics scan.</p>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5">Select a vehicle from your garage and adjust mileage to compute diagnostic insights.</p>
                </div>
              )}
            </div>

            {/* Right: AI Support Assistant & Multilingual Voice bot */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">AI Support Bot</h3>
                    <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <span>ONLINE • VOICE ASSISTANT</span>
                    </span>
                  </div>
                </div>

                {/* Language Selectors */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {(['English', 'Telugu', 'Hindi'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setChatLanguage(lang)}
                      className={`px-2 py-1 text-[9px] font-black rounded-md cursor-pointer transition-all ${
                        chatLanguage === lang ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                      chat.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}>
                      {chat.text}

                      {/* Speaking / Audio controls */}
                      {chat.role === 'model' && (
                        <div className="flex justify-end pt-2 border-t border-slate-100/50 mt-1.5">
                          {isSpeaking ? (
                            <button
                              onClick={handleStopVoice}
                              className="text-[9px] font-black text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded cursor-pointer"
                            >
                              <Square className="w-2.5 h-2.5" />
                              <span>Mute Voice</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSpeakVoice(chat.text)}
                              className="text-[9px] font-black text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded cursor-pointer"
                            >
                              <Mic className="w-2.5 h-2.5" />
                              <span>Read Aloud</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatbotLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-500 italic flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking in {chatLanguage}...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendAIChat} className="border-t border-slate-100 pt-3 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={`Type support query in ${chatLanguage}...`}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim() || chatbotLoading}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* EMERGENCY SOS DESPATCH TRIGGER */}
              <div className="mt-4 pt-3 border-t border-dashed border-slate-150 flex items-center justify-between bg-rose-50 p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-rose-950 uppercase">🚨 Emergency SOS Dispatch</span>
                </div>
                <button
                  onClick={handleTriggerSOS}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded-lg cursor-pointer shadow animate-bounce"
                >
                  TRIGGER HIGHWAY SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- WORKFLOW: LOYALTY CLUB & AMC PLANS --- */}
      {activeSubTab === 'loyalty' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Section Heading */}
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-800 flex items-center justify-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              <span>Loyalty Club & AMC Gold Membership</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Unlock priority vehicle logistics, direct referral cashbacks, and copy promo codes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Col: Digital Wallet Card & Milestone */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[220px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
              
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Loyalty Tier Member</span>
                    <h3 className="text-2xl font-black mt-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                      {membership.tier} Membership
                    </h3>
                  </div>
                  <Award className="w-8 h-8 text-amber-400 animate-bounce" />
                </div>

                <div className="mt-6">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Active Rewards Balance</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-white font-mono">{membership.loyaltyPoints}</span>
                    <span className="text-xs font-bold text-indigo-300">points</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-700/60 pt-4">
                <div className="flex justify-between text-[9px] text-slate-300 font-bold">
                  <span>NEXT MILESTONE: PLATINUM</span>
                  <span>{membership.loyaltyPoints} / 500 PTS</span>
                </div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mt-1.5">
                  <div
                    style={{ width: `${Math.min(100, (membership.loyaltyPoints / 500) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-indigo-400 rounded-full"
                  ></div>
                </div>
              </div>
            </div>

            {/* Middle Col: Referral Engine */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-indigo-500" />
                  <span>Referral Cash Engine</span>
                </h3>
                <p className="text-[10px] text-slate-500 leading-snug mt-1.5">
                  Invite your friends to register. Once they book their first repair, they get 100 points, and you receive 100 points (₹10 value)!
                </p>

                {/* Promo Code copy box */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between mt-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Your Referral Code</span>
                    <strong className="text-xs font-mono font-black text-slate-800">{membership.referralCode}</strong>
                  </div>
                  <button
                    onClick={() => handleCopyCoupon(membership.referralCode)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg cursor-pointer"
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              {/* Friend Apply Input Form */}
              <form onSubmit={handleApplyReferral} className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">Enter Friend's Referral Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. REF-USR-2..."
                    value={referralInputCode}
                    onChange={(e) => setReferralInputCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-mono rounded-lg focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {referralSuccessMsg && <p className="text-[10px] text-emerald-600 font-bold mt-1.5">{referralSuccessMsg}</p>}
                {referralErrorMsg && <p className="text-[10px] text-rose-600 font-bold mt-1.5">{referralErrorMsg}</p>}
              </form>
            </div>

            {/* Right Col: Annual Maintenance Contract (AMC) Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>AMC Annual Care Packages</span>
                </h3>
                <p className="text-[10px] text-slate-500 leading-snug mt-1.5">
                  Activate AMC packages to unlock 3x Free General Services, priority priority-towing queueing, and 25% off all spare parts.
                </p>

                <div className="mt-4 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 flex items-start space-x-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-900 uppercase">AMC Gold Care Plan</h4>
                    <p className="text-[10px] text-emerald-700 leading-snug mt-0.5">Active under subscription. Validity up to Dec 31, 2026.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Free Services Left: <strong>3 of 3</strong></span>
                <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">GOLD STATUS</span>
              </div>
            </div>
          </div>

          {/* Interactive Coupons Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-4">
              <Ticket className="w-4.5 h-4.5 text-blue-500" />
              <span>Available Dynamic Booking Coupons ({coupons.length})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  onClick={() => handleCopyCoupon(coupon.code)}
                  className="border border-dashed border-blue-200 bg-blue-50/20 hover:bg-blue-50/50 transition-all p-3.5 rounded-xl cursor-pointer text-center relative group"
                >
                  <span className="text-xs font-mono font-black text-slate-800 group-hover:text-blue-600 block">{coupon.code}</span>
                  <span className="text-sm font-black text-blue-600 block mt-1">{coupon.discountPercentage}% OFF</span>
                  <span className="text-[8px] text-slate-400 block mt-1">Expiry: {coupon.expiryDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- WORKFLOW: DIGITAL DOCUMENT VAULT --- */}
      {activeSubTab === 'documents' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Section Heading */}
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-800 flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span>Digital Document Vault</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Store PUC certificates, insurance policies, and licenses with automated countdown expiration alarms.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Upload / Log Document */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Upload Document</span>
              </h3>

              <form onSubmit={handleAddDocument} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Document Type</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="PUC">PUC (Pollution Certificate)</option>
                    <option value="Insurance">Insurance Policy</option>
                    <option value="RC">RC (Registration Certificate)</option>
                    <option value="License">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Document Name / Policy Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-12 PUC Cert or TATA-AIG-9988..."
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={newDocExpiry}
                    onChange={(e) => setNewDocExpiry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Simulated Drag and drop */}
                <div className="border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors py-6 text-center rounded-xl cursor-pointer">
                  <Download className="w-5 h-5 text-slate-300 mx-auto mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-500 block">Drag & Drop Document Scan PDF</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">(Simulated drag upload support)</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                >
                  Save & Secure Document
                </button>
              </form>
            </div>

            {/* Right: Active Document Reminders Feed */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Bell className="w-4.5 h-4.5 text-rose-500" />
                <span>Active Vault Documents & Warnings</span>
              </h3>

              {reminders.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-150">
                  <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Your Document Vault is empty.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Add RC, Driver License, and Insurance papers to get auto expiry reminders.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {reminders.map((rem) => {
                    // Calculate days remaining
                    const exp = new Date(rem.expiryDate);
                    const today = new Date();
                    const diffTime = exp.getTime() - today.getTime();
                    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    const isUrgent = daysLeft < 30;
                    const isWarning = daysLeft >= 30 && daysLeft < 90;

                    return (
                      <div
                        key={rem.id}
                        className={`p-4 rounded-xl border flex items-center justify-between ${
                          isUrgent ? 'bg-rose-50 border-rose-100' : isWarning ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3.5">
                          <div className={`p-2 rounded-xl text-white ${
                            isUrgent ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-slate-800'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-black uppercase text-slate-800 bg-white border px-1.5 py-0.5 rounded shadow-sm">
                                {rem.type}
                              </span>
                              <strong className="text-xs font-bold text-slate-800">{rem.docName}</strong>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Expiry Date: {rem.expiryDate}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-full ${
                            isUrgent
                              ? 'bg-rose-200 text-rose-800 animate-pulse'
                              : isWarning
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {daysLeft < 0 ? 'EXPIRED' : `${daysLeft} days left`}
                          </span>
                          
                          <button
                            onClick={() => handleDeleteDocument(rem.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- WORKFLOW: EXPENSE LOGS & ANALYTICS --- */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Section Heading */}
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-800 flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <span>Fuel & Maintenance Expenses Tracker</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Monitor digital fuel receipts, log physical oil/maintenance invoices, and analyze cumulative monthly vehicle runs.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Log Expense form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Log Vehicle Expense</span>
              </h3>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Expense Type</label>
                  <select
                    value={newExpType}
                    onChange={(e) => setNewExpType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="Fuel">Fuel / Gas Refill</option>
                    <option value="Maintenance">Maintenance & Servicing</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Cost Amount ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="e.g. 45.00"
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={newExpDate}
                    onChange={(e) => setNewExpDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Description / Vendor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shell Premium Petrol Fuel or Spark Plug replace..."
                    value={newExpDesc}
                    onChange={(e) => setNewExpDesc(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none"
                  />
                </div>

                {newExpType === 'Fuel' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Quantity (Liters or Gallons)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 45"
                      value={newExpQty}
                      onChange={(e) => setNewExpQty(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  Save Transaction Log
                </button>
              </form>
            </div>

            {/* Right: Charts and table */}
            <div className="lg:col-span-2 space-y-6">
              {/* Responsive Expense Area Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                  <span>Cumulative Outflow Analysis (Last 30 Days)</span>
                </h3>

                <div className="h-60 w-full" id="expenses-area-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={expenses.slice().reverse().map(e => ({
                        date: new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                        amount: e.amount,
                        type: e.type
                      }))}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense History Logs List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <ClipboardList className="w-4.5 h-4.5 text-slate-500" />
                  <span>Interactive Expense Statements</span>
                </h3>

                {expenses.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No logged expenses found. Add some above!</p>
                ) : (
                  <div className="overflow-x-auto max-h-[220px]">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Details</th>
                          <th className="pb-2 text-right">Cost</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {expenses.map((exp) => (
                          <tr key={exp.id} className="text-slate-700 hover:bg-slate-50/50">
                            <td className="py-2.5 font-mono text-[10px] text-slate-400">{exp.date}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                exp.type === 'Fuel' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {exp.type}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-600">{exp.description} {exp.gallonsOrLiters && `(${exp.gallonsOrLiters}L)`}</td>
                            <td className="py-2.5 text-right font-bold text-slate-800 font-mono">₹{exp.amount.toFixed(2)}</td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
