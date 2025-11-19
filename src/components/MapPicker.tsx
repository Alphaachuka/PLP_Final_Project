import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
}

function LocationMarker({ onLocationSelect, initialPosition }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLngExpression | null>(
    initialPosition || null
  );

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPos: L.LatLngExpression = [lat, lng];
      setPosition(newPos);
      onLocationSelect(lat, lng);
    },
  });

  useEffect(() => {
    if (initialPosition) {
      map.setView(initialPosition, map.getZoom());
    }
  }, [initialPosition, map]);

  return position === null ? null : (
    // @ts-ignore
    <Marker position={position} />
  );
}

export const MapPicker = ({ onLocationSelect, initialPosition }: MapPickerProps) => {
  const defaultCenter: L.LatLngExpression = initialPosition || [0, 0];

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}>
      <MapContainer
        // @ts-ignore
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          // @ts-ignore
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // @ts-ignore
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker
          onLocationSelect={onLocationSelect}
          initialPosition={initialPosition}
        />
      </MapContainer>
    </div>
  );
};
