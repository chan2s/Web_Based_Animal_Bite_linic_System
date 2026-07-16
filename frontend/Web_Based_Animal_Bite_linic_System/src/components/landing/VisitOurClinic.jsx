import { useState, useCallback, useRef, useEffect, lazy, Suspense, Component } from 'react';
import { MapPin, Navigation, Copy, Clock, Phone, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';

// Lazy-load Leaflet components
const LeafletMap = lazy(() => import('./LeafletMapLazy'));

// Clinic coordinates
const CLINIC_LAT = 9.362631;
const CLINIC_LNG = 122.805377;
const CLINIC_COORDS = `${CLINIC_LAT}, ${CLINIC_LNG}`;
const GOOGLE_MAPS_URL = `https://www.google.com/maps?q=${CLINIC_LAT},${CLINIC_LNG}`;

// Intersection observer for scroll-triggered animations
function useFadeInOnScroll(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// Error boundary for lazy import failures
class LazyImportErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  handleRetry = () => {
    this.setState({ hasError: false });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-red-50 flex items-center justify-center">
          <div className="text-center px-6">
            <MapPin className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-red-700 mb-1">Unable to load the map</p>
            <p className="text-xs text-red-500 mb-4">Please try again later.</p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              aria-label="Retry loading map"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Map loading skeleton
function MapSkeleton() {
  return (
    <div className="w-full rounded-2xl bg-gray-100 flex items-center justify-center" style={{ height: 'clamp(300px, 35vw, 500px)' }}>
      <div className="text-center px-6">
        <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse mx-auto mb-4 flex items-center justify-center">
          <MapPin className="w-7 h-7 text-gray-300" />
        </div>
        <div className="h-4 bg-gray-200 rounded-full w-36 mx-auto animate-pulse mb-2" />
        <div className="h-3 bg-gray-200 rounded-full w-52 mx-auto animate-pulse" />
      </div>
    </div>
  );
}

export default function VisitOurClinic() {
  const [sectionRef, visible] = useFadeInOnScroll(0.1);
  const [mapError, setMapError] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const handleRetry = useCallback(() => {
    setMapError(false);
    setMapKey((k) => k + 1);
  }, []);

  const handleCopyCoordinates = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CLINIC_COORDS);
      toast.success('Coordinates copied successfully.', {
        duration: 2000,
        style: { background: '#10b981', color: '#fff', fontSize: '13px', padding: '8px 16px' },
      });
    } catch {
      toast.error('Failed to copy coordinates.', {
        duration: 3000,
        style: { background: '#ef4444', color: '#fff', fontSize: '13px', padding: '8px 16px' },
      });
    }
  }, []);

  const infoCards = [
    {
      icon: MapPin,
      label: 'Address',
      value: 'Peping Gamo Street\nBayawan City, Negros Oriental',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Phone,
      label: 'Contact',
      value: 'Contact information available at the clinic.',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: Clock,
      label: 'Clinic Hours',
      value: 'Open during clinic hours',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <section id="visit-us" className="py-20 lg:py-28 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={sectionRef}
          className={`text-center mb-14 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-4">
            Find Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Visit Our Clinic</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            We are located in the heart of Bayawan City. Use the interactive map below to find us easily.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left: Info & Actions */}
          <div
            className={`space-y-6 transition-all duration-700 delay-200 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Crosshair className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1.5">Easy to Find</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Our clinic is conveniently located on Peping Gamo Street in Bayawan City. 
                    Whether you're coming for immediate treatment, consultations, vaccinations, 
                    or follow-up care, our interactive map will guide you right to our doorstep.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            {infoCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`flex items-start gap-4 p-4 md:p-5 rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-md`}
                  style={{
                    transitionDelay: `${300 + i * 100}ms`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
                  <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{card.label}</p>
                    <p className="text-sm text-gray-800 leading-snug whitespace-pre-line">{card.value}</p>
                  </div>
                </div>
              );
            })}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-[0.98]"
                aria-label="Open directions in Google Maps"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
              <button
                onClick={handleCopyCoordinates}
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
                aria-label="Copy coordinates to clipboard"
              >
                <Copy className="w-4 h-4" />
                Copy Coordinates
              </button>
            </div>
          </div>

          {/* Right: Map */}
          <div
            className={`transition-all duration-700 delay-300 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div
              className="w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white"
              style={{ height: 'clamp(300px, 40vw, 500px)' }}
              key={mapKey}
            >
              {mapError ? (
                <div className="w-full h-full bg-red-50 flex items-center justify-center">
                  <div className="text-center px-6">
                    <MapPin className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-red-700 mb-1">Unable to load the map</p>
                    <p className="text-xs text-red-500 mb-4">Please try again later.</p>
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      aria-label="Retry loading map"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <LazyImportErrorBoundary>
                  <Suspense fallback={<MapSkeleton />}>
                    <LeafletMap onError={() => setMapError(true)} />
                  </Suspense>
                </LazyImportErrorBoundary>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
