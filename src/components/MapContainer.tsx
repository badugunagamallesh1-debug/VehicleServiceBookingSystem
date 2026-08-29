/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Check, Navigation, Building2 } from 'lucide-react';
import { ServiceCenter } from '../types';

interface MapContainerProps {
  serviceCenters: ServiceCenter[];
  onSelectCenter?: (center: ServiceCenter) => void;
  selectedCenter?: ServiceCenter | null;
  mode: 'browse' | 'select-pickup' | 'track-job';
  pickupLocation?: { address: string; lat: number; lng: number } | null;
  onSelectPickupLocation?: (loc: { address: string; lat: number; lng: number }) => void;
  destinationLocation?: { lat: number; lng: number } | null;
}

export default function MapContainer({
  serviceCenters,
  onSelectCenter,
  selectedCenter,
  mode,
  pickupLocation,
  onSelectPickupLocation,
}: MapContainerProps) {
  const [selectedCenterState, setSelectedCenterState] = useState<ServiceCenter | null>(null);

  useEffect(() => {
    if (selectedCenter) setSelectedCenterState(selectedCenter);
  }, [selectedCenter]);

  const handleSelect = (center: ServiceCenter) => {
    setSelectedCenterState(center);
    if (onSelectCenter) onSelectCenter(center);
  };

  return (
    <div
      className="h-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden relative min-h-[450px] flex flex-col"
      id="map-container"
    >
      {/* Map-style header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white/80" />
          <span className="text-white font-bold text-sm tracking-wide">Service Center Locator</span>
        </div>
        <span className="text-white/70 text-xs font-medium">{serviceCenters.length} branch{serviceCenters.length !== 1 ? 'es' : ''} nearby</span>
      </div>

      {/* Dot-grid map background */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Road lines decorative */}
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#334155" strokeWidth="6" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#334155" strokeWidth="3" />
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#334155" strokeWidth="4" />
          <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#334155" strokeWidth="3" />
        </svg>

        {/* Center cards list */}
        <div className="relative z-10 p-4 space-y-2.5 overflow-y-auto h-full pb-24">
          {serviceCenters.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Building2 className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm font-medium">No service centers found</p>
            </div>
          )}

          {serviceCenters.map((center) => {
            const isSelected = selectedCenterState?.id === center.id;
            return (
              <div
                key={center.id}
                onClick={() => handleSelect(center)}
                className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 shadow-sm ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 shadow-blue-200 shadow-md'
                    : 'bg-white/90 border-slate-200 hover:border-blue-300 hover:shadow-md hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-white/20' : 'bg-blue-50'
                  }`}>
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {center.name}
                    </h4>
                    <p className={`text-xs mt-0.5 leading-relaxed line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {center.address}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="shrink-0 w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-300 transition-colors" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center justify-between z-20 shadow-lg">
        <div className="min-w-0">
          {selectedCenterState ? (
            <>
              <p className="text-xs font-black text-slate-800 truncate">{selectedCenterState.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{selectedCenterState.address}</p>
            </>
          ) : (
            <p className="text-xs text-slate-400 font-medium">Click a branch to select it</p>
          )}
        </div>

        {mode === 'track-job' && selectedCenterState && (
          <div className="flex items-center gap-1.5 ml-3 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700">Tracking Active</span>
          </div>
        )}

        {selectedCenterState && onSelectCenter && mode !== 'track-job' && (
          <button
            onClick={() => onSelectCenter(selectedCenterState)}
            className="ml-3 shrink-0 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer"
          >
            Choose Branch
          </button>
        )}
      </div>
    </div>
  );
}
