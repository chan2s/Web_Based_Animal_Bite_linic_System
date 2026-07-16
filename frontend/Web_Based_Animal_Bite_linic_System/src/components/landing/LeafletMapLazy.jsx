import { Component } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { L } from 'leaflet';

// Fix default Leaflet marker icon — wrapped in try-catch to prevent
// module evaluation failures from crashing the lazy import
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
} catch (e) {
  console.warn('[LeafletMap] Failed to fix default marker icon:', e);
}

const CLINIC_LAT = 9.362631;
const CLINIC_LNG = 122.805377;

// Error boundary for map render crashes
class MapErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('[LeafletMap] Render error:', error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.onError) this.props.onError();
      return null;
    }
    return this.props.children;
  }
}

export default function LeafletMapLazy({ onError }) {
  return (
    <MapErrorBoundary onError={onError}>
      <MapContainer
        center={[CLINIC_LAT, CLINIC_LNG]}
        zoom={17}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
        dragging={true}
        touchZoom={true}
        style={{ width: '100%', height: '100%' }}
        aria-label="Clinic location interactive map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[CLINIC_LAT, CLINIC_LNG]}>
          <Popup>
            <div className="min-w-[180px]">
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-sm text-gray-900">Animal Bite Clinic</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed ml-6">
                Peping Gamo Street<br />
                Bayawan City, Negros Oriental
              </p>
              <div className="flex items-center gap-1.5 mt-2 ml-6">
                <Clock className="w-3 h-3 text-green-600" />
                <span className="text-[11px] text-green-700 font-medium">Open during clinic hours</span>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </MapErrorBoundary>
  );
}
