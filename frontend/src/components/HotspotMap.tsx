'use client';
import { useEffect, useState } from 'react';
import { Hotspot } from '@/types';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for Leaflet because it relies on window
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function HotspotMap({ hotspots }: { hotspots: Hotspot[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !hotspots) return <div className="animate-pulse bg-[#171717] w-full h-full"></div>;

  // Default center (New Delhi as example for hackathon)
  const center: [number, number] = [28.6139, 77.2090];

  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-full w-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">Carto</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {hotspots.map((spot, i) => (
        <CircleMarker
          key={i}
          center={[spot.lat, spot.lng]}
          radius={spot.weight * 2.5}
          pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.4, weight: 1 }}
        >
          <Popup>Urgency Score: {spot.weight.toFixed(1)}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
