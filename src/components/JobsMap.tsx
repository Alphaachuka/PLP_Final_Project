import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "./ui/button";
import { DollarSign, MapPin } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Job {
  id: string;
  title: string;
  payment_amount: number;
  location: {
    city: string;
    lat?: number;
    lng?: number;
  };
}

interface JobsMapProps {
  jobs: Job[];
}

export const JobsMap = ({ jobs }: JobsMapProps) => {
  const jobsWithCoords = jobs.filter(
    (job) => job.location?.lat && job.location?.lng
  );

  const defaultCenter: L.LatLngExpression = jobsWithCoords.length > 0
    ? [jobsWithCoords[0].location.lat!, jobsWithCoords[0].location.lng!]
    : [0, 0];

  return (
    <div style={{ height: "600px", width: "100%", borderRadius: "0.5rem" }}>
      <MapContainer
        // @ts-ignore
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          // @ts-ignore
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // @ts-ignore
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {jobsWithCoords.map((job) => (
          <Marker
            key={job.id}
            // @ts-ignore
            position={[job.location.lat!, job.location.lng!]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-2">{job.title}</h3>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <span className="font-bold">${job.payment_amount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{job.location.city}</span>
                </div>
                <Button asChild size="sm" className="w-full">
                  <Link to={`/jobs/${job.id}`}>View Details</Link>
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
