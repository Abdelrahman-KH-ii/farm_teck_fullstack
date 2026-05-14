"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons (not strictly needed for CircleMarkers, but good practice)
import L from "leaflet";
L.Icon.Default.imagePath = "/images/";

interface CropFieldFeature {
  type: string;
  id: number;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    field_id: string;
    crop: string;
    year: number;
    ndvi_mean: number;
    soil_ph: number;
    fertility_index: number;
  };
}

interface CropMapProps {
  selectedCrop?: string;
  year?: number;
}

const colorMap: Record<string, string> = {
  wheat: "#f5deb3", // Wheat
  corn: "#ffeb3b", // Yellow
  cotton: "#ffffff", // White/light gray
  rice: "#8bc34a", // Light Green
  tomato: "#f44336", // Red
  potato: "#8d6e63", // Brown
  alfalfa: "#4caf50", // Green
  other: "#9e9e9e", // Gray
};

export default function CropMap({ selectedCrop, year = 2024 }: CropMapProps) {
  const [features, setFeatures] = useState<CropFieldFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      try {
        let url = `/api/ai_core/fields/map/?year=${year}`;
        if (selectedCrop && selectedCrop !== "all") {
          url += `&crop=${selectedCrop}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch map data");
        const data = await res.json();
        setFeatures(data.features || []);
      } catch (err) {
        console.error(err);
        setError("Could not load map data");
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [selectedCrop, year]);

  if (loading) {
    return <div className="h-[400px] flex items-center justify-center bg-muted/20">Loading Map Data...</div>;
  }

  if (error) {
    return <div className="h-[400px] flex items-center justify-center bg-destructive/10 text-destructive">{error}</div>;
  }

  // Egypt's approximate center
  const center: [number, number] = [26.8206, 30.8025];
  
  // If we have data, try to center on the first point
  const mapCenter = features.length > 0 
    ? [features[0].geometry.coordinates[1], features[0].geometry.coordinates[0]] as [number, number]
    : center;

  return (
    <div className="relative h-[400px] w-full rounded-md overflow-hidden z-0">
      <MapContainer center={mapCenter} zoom={features.length > 0 ? 8 : 5} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {features.map((feature) => {
          const { coordinates } = feature.geometry;
          const { crop, field_id, ndvi_mean, soil_ph, fertility_index } = feature.properties;
          const color = colorMap[crop.toLowerCase()] || colorMap.other;

          return (
            <CircleMarker
              key={feature.id}
              center={[coordinates[1], coordinates[0]]}
              radius={6}
              pathOptions={{ fillColor: color, color: "#333", weight: 1, fillOpacity: 0.8 }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm mb-1">{crop.charAt(0).toUpperCase() + crop.slice(1)} Field</h3>
                  <div className="text-xs space-y-1">
                    <p><strong>ID:</strong> {field_id}</p>
                    <p><strong>NDVI:</strong> {ndvi_mean.toFixed(2)}</p>
                    <p><strong>Soil pH:</strong> {soil_ph.toFixed(1)}</p>
                    <p><strong>Fertility:</strong> {fertility_index.toFixed(2)}</p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-background/90 p-2 rounded-md shadow-md border text-xs z-[400]">
        <h4 className="font-bold mb-2">Crop Types</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(colorMap).map(([crop, color]) => (
            <div key={crop} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: color }}></span>
              <span className="capitalize">{crop}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
