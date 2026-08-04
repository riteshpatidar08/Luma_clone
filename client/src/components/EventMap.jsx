import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix default marker icons issue in Leaflet with Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to center map when lat/lng change
function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export function EventMap({ lat, lng, label, className }) {
  const hasCoords = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);

  if (!hasCoords) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-luma-text-muted ${className || 'h-48'}`}>
        <MapPin className="w-5 h-5 text-luma-yellow" />
        <p className="text-xs">No location coordinates available for map preview</p>
      </div>
    );
  }

  const position = [lat, lng];

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-white/[0.08] ${className || 'h-48 w-full'}`}>
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', backgroundColor: '#131517' }}
        attributionControl={false}
      >
        {/* Standard OpenStreetMap light tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Marker position={position} />
        <MapCenterController center={position} />
      </MapContainer>
    </div>
  );
}
