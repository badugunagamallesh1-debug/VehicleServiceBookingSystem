/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Wrench, Calendar, Clock, DollarSign, Map,
  CheckCircle, Plus, Send, Edit2, ShieldAlert, Award, Grid,
  Check, X, Settings, QrCode
} from 'lucide-react';
import { Booking, ServiceCenter, User } from '../types';
import MapContainer from './MapContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'bookings' | 'users' | 'branches' | 'upi'>('stats');
  
  // States
  const [stats, setStats] = useState<{
    totalCustomers: number;
    totalMechanics: number;
    activeBookings: number;
    completedServices: number;
    totalRevenue: number;
    statusBreakdown: Record<string, number>;
  } | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [mechanics, setMechanics] = useState<User[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);

  // UPI Config states
  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [hasLoadedUpi, setHasLoadedUpi] = useState(false);

  // Assignment Modal State
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [assignedMechanicId, setAssignedMechanicId] = useState('');

  const fetchAdminData = async () => {
    try {
      const headers = { 'x-user-id': 'usr-3', 'x-user-role': 'ADMIN' };
      
      // Stats
      const sRes = await fetch('/api/admin/stats');
      const sData = await sRes.json();
      setStats(sData);

      // Bookings
      const bRes = await fetch('/api/bookings', { headers });
      const bData = await bRes.json();
      setBookings(bData);

      // Mechanics list
      const mRes = await fetch('/api/admin/mechanics');
      const mData = await mRes.json();
      setMechanics(mData);

      // Branches
      const cRes = await fetch('/api/service-centers');
      const cData = await cRes.json();
      setServiceCenters(cData);

      // UPI settings
      if (!hasLoadedUpi) {
        const uRes = await fetch('/api/upi-settings');
        const uData = await uRes.json();
        setUpiId(uData.upiId);
        setMerchantName(uData.merchantName);
        setHasLoadedUpi(true);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Assign Mechanic Action
  const handleAssignMechanic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !assignedMechanicId) return;

    try {
      const res = await fetch(`/api/bookings/${selectedBookingId}/assign?mechanicId=${assignedMechanicId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setSelectedBookingId(null);
        setAssignedMechanicId('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to assign mechanic:', err);
    }
  };

  // Approve UPI Payment
  const handleApproveUpi = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/approve-upi`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('UPI Payment has been approved! The booking status is now COMPLETED.');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to approve UPI payment:', err);
    }
  };

  // Reject UPI Payment
  const handleRejectUpi = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reject-upi`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('UPI Payment has been rejected. Customer has been alerted to re-submit.');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to reject UPI payment:', err);
    }
  };

  // Save UPI Configurations
  const handleUpdateUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/upi-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ upiId, merchantName })
      });
      if (res.ok) {
        alert('UPI configurations updated and synchronized with all customer terminals.');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update UPI settings:', err);
    }
  };

  // Prepare chart datasets
  const chartData = stats ? [
    { name: 'Pending Approval', count: stats.statusBreakdown.PENDING || 0 },
    { name: 'Confirmed', count: stats.statusBreakdown.CONFIRMED || 0 },
    { name: 'Service In Progress', count: stats.statusBreakdown.SERVICE_IN_PROGRESS || 0 },
    { name: 'Ready', count: stats.statusBreakdown.READY_FOR_DELIVERY || 0 },
    { name: 'Completed', count: stats.completedServices || 0 }
  ] : [];

  const revenueHistory = [
    { date: 'July 05', revenue: 240 },
    { date: 'July 06', revenue: 380 },
    { date: 'July 07', revenue: 490 },
    { date: 'July 08', revenue: 650 },
    { date: 'July 09', revenue: 810 },
    { date: 'July 10', revenue: stats?.totalRevenue || 920 }
  ];

  return (
    <div className="space-y-8" id="admin-dashboard-root">
      {/* Overview stats header */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { label: 'Active Mechanics', value: stats.totalMechanics, icon: Wrench, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { label: 'Pending Jobs', value: bookings.filter(b => b.status === 'PENDING').length, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'Completed Repairs', value: stats.completedServices, icon: CheckCircle, color: 'text-teal-600 bg-teal-50 border-teal-100' },
            { label: 'Gross Revenue', value: `₹${stats.totalRevenue}`, icon: DollarSign, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <h4 className="text-lg font-black text-slate-800 mt-0.5 font-mono">{card.value}</h4>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Menu Tabs */}
      <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-xl max-w-xl mx-auto">
        {[
          { id: 'stats', label: 'Analytics Dashboard' },
          { id: 'bookings', label: 'Assign & Manage Jobs' },
          { id: 'upi', label: 'UPI & Scanner Desk' },
          { id: 'branches', label: 'Branch Maps' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- DASHBOARD ANALYTICS --- */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1: Status Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Job Milestone Distribution</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Revenue Performance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Gross Revenue Trend ($)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- ASSIGN & MANAGE JOBS --- */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">All Repair Order Bookings</h3>
            <span className="text-[11px] text-slate-400 font-bold">{bookings.length} orders logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Job ID</th>
                  <th className="px-6 py-3.5">Customer & Vehicle</th>
                  <th className="px-6 py-3.5">Branch Location</th>
                  <th className="px-6 py-3.5">Service Package</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Assigned Mechanic</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">#{booking.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800">{booking.customerName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{booking.vehicleDetails.make} {booking.vehicleDetails.model} ({booking.vehicleDetails.licensePlate})</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{booking.serviceCenterName}</td>
                    <td className="px-6 py-4 font-mono text-slate-600 font-bold">₹{booking.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.mechanicName ? (
                        <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{booking.mechanicName.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!booking.mechanicId && (
                        <button
                          onClick={() => setSelectedBookingId(booking.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center space-x-1 ml-auto"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Mechanic</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mechanic Assignment Modal Backdrop */}
          {selectedBookingId && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl">
                <div className="text-center">
                  <h4 className="text-base font-black text-slate-800">Dispatch Certified Mechanic</h4>
                  <p className="text-xs text-slate-400 mt-1">Select a verified technician to assign to booking job #{selectedBookingId}.</p>
                </div>

                <form onSubmit={handleAssignMechanic} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Active Technicians</label>
                    <select
                      required
                      value={assignedMechanicId}
                      onChange={(e) => setAssignedMechanicId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg focus:outline-none focus:bg-white"
                    >
                      <option value="">-- Choose Operator --</option>
                      {mechanics.map(m => (
                        <option key={m.id} value={m.id}>{m.name} (ID: {m.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingId(null)}
                      className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-50 text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!assignedMechanicId}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer text-center"
                    >
                      Confirm Dispatch
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- BRANCH MAPS VIEW --- */}
      {activeTab === 'branches' && (
        <div className="space-y-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Nationwide Service Network</h3>
            <p className="text-xs text-slate-400 mt-0.5">Monitoring all 4 primary diagnostic centers and hybrid EV garages.</p>
          </div>

          <div className="h-[400px]">
            <MapContainer
              serviceCenters={serviceCenters}
              mode="browse"
            />
          </div>
        </div>
      )}

      {/* --- UPI & SCANNER CONTROL DESK --- */}
      {activeTab === 'upi' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Config & Interactive Scanner Simulation */}
          <div className="space-y-6">
            {/* UPI Settings Setup */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-blue-600" />
                <span>UPI Merchant Setup</span>
              </h3>

              <form onSubmit={handleUpdateUpi} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Merchant Business Name</label>
                  <input
                    type="text"
                    required
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="e.g. Vehicle Service Hub Ltd"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:outline-none focus:bg-white text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Active UPI ID / VPA</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. pay@axisbank"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:outline-none focus:bg-white font-mono text-blue-600 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow cursor-pointer transition-colors"
                >
                  Save VPA Configurations
                </button>
              </form>
            </div>

            {/* Merchant QR Code Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-sm text-center">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Customer Terminal Preview</h4>
              
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/80 animate-bounce" />
                
                <div className="w-28 h-28 bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `upi://pay?pa=${upiId}&pn=${merchantName}&am=100&cu=INR`
                    )}`}
                    alt="UPI VPA Live Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="mt-2 space-y-0.5">
                  <span className="text-[10px] font-black text-slate-800 block">{merchantName || 'Vehicle Service Hub'}</span>
                  <span className="text-[9px] font-mono text-blue-600 font-bold block">{upiId || 'pay@axisbank'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Pending UPI Approvals Queue */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Pending UTR Verification Desk ({bookings.filter(b => b.paymentStatus === 'PENDING_APPROVAL').length})</span>
            </h3>

            {bookings.filter(b => b.paymentStatus === 'PENDING_APPROVAL').length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <CheckCircle className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Clear Queue! No pending UPI payments require verification.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.filter(b => b.paymentStatus === 'PENDING_APPROVAL').map((booking) => (
                  <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">Job ID: {booking.id}</span>
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Awaiting Approval
                        </span>
                      </div>
                      
                      <div className="space-y-0.5 text-[11px] text-slate-500">
                        <p>Customer: <strong className="text-slate-800">{booking.customerName}</strong></p>
                        <p>Vehicle: <strong className="text-slate-700">{booking.vehicleDetails.make} {booking.vehicleDetails.model} ({booking.vehicleDetails.licensePlate})</strong></p>
                        <p>Bill Amount: <strong className="text-blue-600 font-mono">₹{booking.totalAmount.toFixed(2)}</strong></p>
                        <p>Sub Branch: <strong className="text-slate-700">{booking.serviceCenterName}</strong></p>
                      </div>

                      {/* Transformed UTR field */}
                      <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Customer Submitted UTR</span>
                          <span className="text-xs font-mono font-black text-slate-800 tracking-wider">
                            {booking.upiUtr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full md:w-auto shrink-0 self-stretch justify-center">
                      <button
                        onClick={() => handleApproveUpi(booking.id)}
                        className="flex-1 md:flex-none py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1 shadow cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Payment</span>
                      </button>

                      <button
                        onClick={() => handleRejectUpi(booking.id)}
                        className="flex-1 md:flex-none py-2 px-4 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline UTR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
