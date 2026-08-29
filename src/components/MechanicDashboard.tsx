/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wrench, MapPin, CheckCircle, Navigation, Play,
  Loader, FileText, Camera, Plus, Trash2, ShieldAlert, BadgeDollarSign, CheckSquare
} from 'lucide-react';
import { Booking, BookingStatus, SparePartUsed } from '../types';
import { AVAILABLE_SPARE_PARTS } from '../data';
import MapContainer from './MapContainer';

interface MechanicDashboardProps {
  currentUser: { id: string; name: string; email: string };
}

export default function MechanicDashboard({ currentUser }: MechanicDashboardProps) {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  
  // Workshop form states for the active job
  const [statusVal, setStatusVal] = useState<BookingStatus>('SERVICE_IN_PROGRESS');
  const [repairNotes, setRepairNotes] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partsUsed, setPartsUsed] = useState<SparePartUsed[]>([]);
  
  // Custom mock image uploads
  const [repairImageMock, setRepairImageMock] = useState('');

  const fetchJobs = async () => {
    try {
      const headers = { 'x-user-id': currentUser.id, 'x-user-role': 'MECHANIC' };
      const res = await fetch('/api/bookings', { headers });
      const data = await res.json();
      setJobs(data);

      // Keep active job object in sync with latest database details
      if (activeJob) {
        const updated = data.find((b: Booking) => b.id === activeJob.id);
        if (updated) {
          setActiveJob(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch mechanic jobs:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, [activeJob?.id]);

  // Load initial workshop values when active job is clicked
  const handleOpenWorkshop = (job: Booking) => {
    setActiveJob(job);
    setStatusVal(job.status);
    setRepairNotes(job.repairNotes || '');
    setPartsUsed(job.sparePartsUsed || []);
  };

  // Self-claim unassigned booking
  const handleClaimJob = async () => {
    if (!activeJob) return;
    try {
      const res = await fetch(`/api/bookings/${activeJob.id}/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': 'MECHANIC'
        },
        body: JSON.stringify({ mechanicId: currentUser.id })
      });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      console.error('Failed to claim job', err);
    }
  };

  // Status state transition
  const handleUpdateStatus = async (newStatus: BookingStatus) => {
    if (!activeJob) return;
    try {
      const res = await fetch(`/api/bookings/${activeJob.id}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': 'MECHANIC'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setStatusVal(newStatus);
        fetchJobs();
      }
    } catch (err) {
      console.error('Failed to transition status', err);
    }
  };

  // Add parts used to active booking
  const handleAddPart = async () => {
    if (!activeJob || !selectedPartId) return;
    const partTemplate = AVAILABLE_SPARE_PARTS.find(p => p.id === selectedPartId);
    if (!partTemplate) return;

    // Check if part is already added to sum quantity
    const existingIndex = partsUsed.findIndex(p => p.name === partTemplate.name);
    let updatedParts = [...partsUsed];
    if (existingIndex !== -1) {
      updatedParts[existingIndex].quantity += partQty;
    } else {
      updatedParts.push({
        name: partTemplate.name,
        price: partTemplate.price,
        quantity: partQty
      });
    }

    setPartsUsed(updatedParts);
    setSelectedPartId('');
    setPartQty(1);

    // Save parts update to backend
    await saveRepairDetails(updatedParts, repairNotes, activeJob.repairImages);
  };

  const handleDeletePart = async (idx: number) => {
    const updatedParts = partsUsed.filter((_, i) => i !== idx);
    setPartsUsed(updatedParts);
    await saveRepairDetails(updatedParts, repairNotes, activeJob ? activeJob.repairImages : []);
  };

  const handleSaveNotes = async () => {
    if (!activeJob) return;
    await saveRepairDetails(partsUsed, repairNotes, activeJob.repairImages);
    alert('Diagnostics notes saved securely.');
  };

  const handleSimulateImageUpload = async () => {
    if (!activeJob) return;
    const presetImages = [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1617886322168-72b886573c3c?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=400'
    ];
    // Random image from list
    const randomImg = presetImages[Math.floor(Math.random() * presetImages.length)];
    const updatedImages = [...(activeJob.repairImages || []), randomImg];
    
    await saveRepairDetails(partsUsed, repairNotes, updatedImages);
  };

  // Save changes helper
  const saveRepairDetails = async (spares: SparePartUsed[], notes: string, images: string[]) => {
    if (!activeJob) return;
    try {
      await fetch(`/api/bookings/${activeJob.id}/repair-details`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': 'MECHANIC'
        },
        body: JSON.stringify({
          repairNotes: notes,
          sparePartsUsed: spares,
          repairImages: images
        })
      });
      fetchJobs();
    } catch (err) {
      console.error('Failed to sync details', err);
    }
  };

  const getStatusOrder = (status: BookingStatus) => {
    const map: Record<BookingStatus, number> = {
      PENDING: 1,
      CONFIRMED: 2,
      VEHICLE_RECEIVED: 3,
      INSPECTION: 4,
      SERVICE_IN_PROGRESS: 5,
      WAITING_FOR_SPARE_PARTS: 6,
      QUALITY_CHECK: 7,
      READY_FOR_DELIVERY: 8,
      COMPLETED: 9
    };
    return map[status] || 0;
  };

  return (
    <div className="space-y-8" id="mechanic-dashboard-root">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white">
            <Wrench className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Mechanic Diagnostics Terminal</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Operator: {currentUser.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            ● Active Workshop Session
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ACTIVE ASSIGNED JOBS LIST */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Workshop Jobs Queue</h3>
          
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No registered bookings in queue. Refreshing...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const isActive = activeJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => handleOpenWorkshop(job)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50/20' 
                        : 'border-slate-150 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-slate-400">JOB #{job.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        job.status === 'COMPLETED' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {job.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 mt-2">
                      {job.vehicleDetails.make} {job.vehicleDetails.model}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{job.packageName}</p>
                    
                    <div className="mt-2.5 flex items-center gap-1.5">
                      {!job.mechanicId ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 inline-block animate-pulse">
                          🆕 Unassigned (Available)
                        </span>
                      ) : job.mechanicId === currentUser.id ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                          🛠️ Assigned to Me
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 inline-block">
                          👤 Assigned: {job.mechanicName || 'Other Mechanic'}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                      <span>Client: {job.customerName}</span>
                      <span>{job.bookingDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: WORKSPACE FOR SELECTED JOB */}
        <div className="lg:col-span-2 space-y-6">
          {activeJob ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              
              {/* Job Header Info */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-xs text-slate-400 font-mono">WORKSPACE FOR JOB #{activeJob.id}</span>
                  <h3 className="text-base font-black text-slate-800 mt-0.5">
                    {activeJob.vehicleDetails.make} {activeJob.vehicleDetails.model} Servicing
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">{activeJob.customerName} • {activeJob.customerPhone || 'No Phone'}</p>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 font-mono">Est Bill Amount</span>
                  <span className="text-lg font-black font-mono text-blue-600">₹{activeJob.totalAmount}</span>
                </div>
              </div>

              {/* If job is unassigned, prompt mechanic to claim it */}
              {!activeJob.mechanicId && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
                  <div>
                    <h4 className="text-xs font-bold text-amber-800">⚠️ This Job is Currently Unassigned</h4>
                    <p className="text-[10px] text-amber-600 mt-0.5">Claim this job to officially register as the servicing technician.</p>
                  </div>
                  <button
                    onClick={handleClaimJob}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider"
                  >
                    Accept & Claim Job
                  </button>
                </div>
              )}

              {/* Geo navigation block */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Navigation className="w-4 h-4 text-rose-500" />
                  <span>Customer & Logistics Navigation</span>
                </h4>
                
                <div className="h-[220px] rounded-xl overflow-hidden border border-slate-150">
                  <MapContainer
                    serviceCenters={[]}
                    selectedCenter={null}
                    mode="track-job"
                    pickupLocation={activeJob.pickupRequested ? activeJob.pickupLocation : null}
                  />
                </div>
                {activeJob.pickupRequested && activeJob.pickupLocation && (
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                    🗺️ Pickup Address: <span className="text-slate-800">{activeJob.pickupLocation.address}</span>
                  </p>
                )}
              </div>

              {/* Status workflow transitions */}
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Update Workflow Milestones</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'VEHICLE_RECEIVED', label: '1. Vehicle Arrived' },
                    { key: 'INSPECTION', label: '2. Under Inspection' },
                    { key: 'SERVICE_IN_PROGRESS', label: '3. In Servicing' },
                    { key: 'WAITING_FOR_SPARE_PARTS', label: '4. Awaiting Parts' },
                    { key: 'QUALITY_CHECK', label: '5. Quality Control' },
                    { key: 'READY_FOR_DELIVERY', label: '6. Ready for Delivery' },
                  ].map((btn) => {
                    const isSelected = activeJob.status === btn.key;
                    return (
                      <button
                        key={btn.key}
                        onClick={() => handleUpdateStatus(btn.key as any)}
                        className={`py-2 px-2.5 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>

                {activeJob.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow transition-colors flex items-center justify-center space-x-1.5 cursor-pointer mt-3"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Complete Workshop & Release Job</span>
                  </button>
                )}
              </div>

              {/* Diagnostics notes and pictures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Diagnostics Notes</h4>
                  <textarea
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    placeholder="Enter diagnostic details, tire tread levels, engine metrics, or completed replacements..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none focus:bg-white h-28"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Save Diagnosis Notes
                  </button>
                </div>

                {/* Repair images */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Repair Images Feed</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {activeJob.repairImages && activeJob.repairImages.map((img, idx) => (
                      <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-inner relative">
                        <img src={img} alt="repair log" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    
                    <button
                      onClick={handleSimulateImageUpload}
                      className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50/10 cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4 text-slate-400" />
                      <span className="text-[8px] text-slate-400 font-bold mt-1">Upload Photo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Spare Parts Logging Tool */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Deduct Spare Parts & Hardware</h4>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <select
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg focus:outline-none"
                    >
                      <option value="">-- Choose Spare Part --</option>
                      {AVAILABLE_SPARE_PARTS.map(part => (
                        <option key={part.id} value={part.id}>{part.name} - ${part.price}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={partQty}
                      onChange={(e) => setPartQty(parseInt(e.target.value) || 1)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 text-xs text-center text-slate-700 rounded-lg focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleAddPart}
                    disabled={!selectedPartId}
                    className="px-4 py-2 bg-blue-600 disabled:opacity-40 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Add Part to Bill
                  </button>
                </div>

                {/* Logged parts list */}
                {partsUsed.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 space-y-1.5">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase">Parts Logged to Job</h5>
                    <div className="space-y-1">
                      {partsUsed.map((part, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-slate-600">
                          <span>{part.name} (x{part.quantity}) - ${part.price * part.quantity}</span>
                          <button
                            onClick={() => handleDeletePart(idx)}
                            className="text-rose-500 hover:text-rose-700 text-[10px] font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl py-24 text-center">
              <Loader className="w-8 h-8 text-slate-300 mx-auto animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Select an assigned job from your queue to open the active workshop.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
