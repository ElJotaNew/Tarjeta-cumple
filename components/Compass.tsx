import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Compass as CompassIcon, MapPin, Navigation, Info } from 'lucide-react';
import { GeolocationState } from '../types';

interface CompassProps {
  venueLat: number;
  venueLng: number;
  onLocationUpdate?: (state: GeolocationState) => void;
}

export default function Compass({ venueLat, venueLng, onLocationUpdate }: CompassProps) {
  const [mode, setMode] = useState<'north' | 'party'>('north');
  const [geoState, setGeoState] = useState<GeolocationState>({
    status: 'idle',
    distance: null,
    bearing: null,
  });
  const [manualRotation, setManualRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const compassRingRef = useRef<SVGSVGElement>(null);
  const controls = useAnimation();

  // Helper: Haversine distance
  const toRad = (v: number) => (v * Math.PI) / 180;
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Helper: Initial bearing towards venue from current location
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lon2 - lon1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    const bearing = ((θ * 180) / Math.PI + 360) % 360; // in degrees
    return bearing;
  };

  const requestLocation = () => {
    setGeoState((prev) => ({ ...prev, status: 'locating', errorMsg: undefined }));
    if (onLocationUpdate) onLocationUpdate({ status: 'locating', distance: null, bearing: null });

    if (!navigator.geolocation) {
      const errMsg = 'Tu navegador no permite compartir ubicación.';
      setGeoState((prev) => ({ ...prev, status: 'error', errorMsg: errMsg }));
      if (onLocationUpdate) onLocationUpdate({ status: 'error', distance: null, bearing: null, errorMsg: errMsg });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;

        const dist = calculateDistance(uLat, uLng, venueLat, venueLng);
        const bear = calculateBearing(uLat, uLng, venueLat, venueLng);

        const successState: GeolocationState = {
          status: 'success',
          distance: dist,
          bearing: bear,
        };

        setGeoState(successState);
        setMode('party'); // auto-switch to show bearing
        if (onLocationUpdate) onLocationUpdate(successState);

        // Animate needle settling at the party angle
        controls.start({
          rotate: bear,
          transition: { type: 'spring', stiffness: 80, damping: 15 }
        });
      },
      (err) => {
        console.warn('Geolocation error:', err);
        const errMsg = 'No pudimos acceder a tu ubicación. Verifica los permisos de tu navegador.';
        setGeoState((prev) => ({ ...prev, status: 'error', errorMsg: errMsg }));
        if (onLocationUpdate) onLocationUpdate({ status: 'error', distance: null, bearing: null, errorMsg: errMsg });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Build the outer ticks for the compass dial (every 10 deg)
  const renderTicks = () => {
    const ticks = [];
    for (let deg = 0; deg < 360; deg += 10) {
      const rad = toRad(deg - 90);
      const isMajor = deg % 30 === 0;
      const rOuter = 100;
      const rInner = isMajor ? 88 : 93;
      const x1 = 120 + rOuter * Math.cos(rad);
      const y1 = 120 + rOuter * Math.sin(rad);
      const x2 = 120 + rInner * Math.cos(rad);
      const y2 = 120 + rInner * Math.sin(rad);

      ticks.push(
        <line
          key={deg}
          x1={x1.toFixed(2)}
          y1={y1.toFixed(2)}
          x2={x2.toFixed(2)}
          y2={y2.toFixed(2)}
          stroke="var(--color-steel)"
          strokeWidth={isMajor ? 1.6 : 1}
          opacity={isMajor ? 0.8 : 0.4}
        />
      );
    }
    return ticks;
  };

  // Rotate needle back when switching modes
  useEffect(() => {
    if (mode === 'north') {
      controls.start({
        rotate: 0,
        transition: { type: 'spring', stiffness: 120, damping: 12, delay: 0.1 }
      });
    } else if (mode === 'party' && geoState.bearing !== null) {
      controls.start({
        rotate: geoState.bearing,
        transition: { type: 'spring', stiffness: 80, damping: 15 }
      });
    }
  }, [mode, geoState.bearing, controls]);

  // Handle dial manual rotation with drag
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Decorative and Interactive Compass Card */}
      <div className="relative flex flex-col items-center p-6 w-full max-w-sm rounded-3xl bg-depth/40 border border-steel/20 backdrop-blur-md shadow-2xl">
        {/* Sparkles / Mode indicators */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-[9px] uppercase tracking-[2px] text-mist/80 font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${mode === 'north' ? 'bg-mist animate-pulse' : 'bg-steel/30'}`} />
            <span>N-Modo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${mode === 'party' ? 'bg-white animate-pulse' : 'bg-steel/30'}`} />
            <span>Party-Modo</span>
          </div>
        </div>

        {/* Compass Ring */}
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="relative w-64 h-64 mt-4 drop-shadow-[0_0_35px_rgba(77,103,134,0.25)] select-none cursor-grab active:cursor-grabbing"
        >
          <svg
            ref={compassRingRef}
            viewBox="0 0 240 240"
            className="w-full h-full overflow-visible"
            aria-label="Brújula astronómica interactiva"
          >
            <defs>
              <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="var(--color-mist)" />
              </linearGradient>
              <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-depth)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--color-void)" stopOpacity="0.8" />
              </radialGradient>
            </defs>

            {/* Outer Compass border */}
            <circle cx="120" cy="120" r="102" fill="url(#ringGlow)" stroke="var(--color-steel)" strokeWidth="1" opacity="0.3" />
            <circle cx="120" cy="120" r="100" fill="none" stroke="var(--color-steel)" strokeWidth="1" opacity="0.6" />

            {/* Generated Ticks (Slow continuous cosmic spin) */}
            <motion.g 
              id="ticks-group"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 180, ease: "linear" }}
              style={{ transformOrigin: '120px 120px' }}
            >
              {renderTicks()}
            </motion.g>

            {/* Cardinal Letters */}
            <text x="120" y="22" textAnchor="middle" dominantBaseline="middle" className="fill-mist font-mono font-medium text-[11px] tracking-widest">N</text>
            <text x="218" y="122" textAnchor="middle" dominantBaseline="middle" className="fill-mist font-mono font-medium text-[11px] tracking-widest">E</text>
            <text x="120" y="220" textAnchor="middle" dominantBaseline="middle" className="fill-mist font-mono font-medium text-[11px] tracking-widest">S</text>
            <text x="22" y="122" textAnchor="middle" dominantBaseline="middle" className="fill-mist font-mono font-medium text-[11px] tracking-widest">W</text>

            {/* Inner Ring Dial */}
            <circle cx="120" cy="120" r="54" fill="var(--color-depth)" stroke="var(--color-steel)" strokeWidth="1" opacity="0.9" />

            {/* Center Big 18 Graphic with custom pulsing / aura */}
            <motion.text 
              x="120" 
              y="125" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              className="fill-silver font-serif font-semibold text-[56px] select-none pointer-events-none"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              18
            </motion.text>

            {/* Interactive Animated Needle */}
            <motion.g
              animate={controls}
              initial={{ rotate: -140 }}
              style={{ transformOrigin: '120px 120px' }}
              className="pointer-events-none"
            >
              <motion.g
                animate={{ rotate: [-0.8, 0.8, -0.8] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ transformOrigin: '120px 120px' }}
              >
                {/* Compass Needle Polygon */}
                <polygon points="120,24 127,120 120,148 113,120" fill="url(#needleGrad)" />
              </motion.g>
              {/* Golden/Brass accent pivot */}
              <circle cx="120" cy="120" r="4.5" fill="var(--color-silver)" />
              <circle cx="120" cy="120" r="2" fill="var(--color-steel)" />
            </motion.g>
          </svg>
        </motion.div>

        {/* Current Coordinates/Angle Output */}
        <div className="mt-5 font-mono text-[11px] text-mist tracking-[2.5px] uppercase">
          {mode === 'north' ? (
            <span>N 0° 0' 00" · Calibrado</span>
          ) : (
            <span>
              {geoState.bearing !== null 
                ? `RUMBO: ${geoState.bearing.toFixed(1)}° NE` 
                : 'Calculando rumbo...'}
            </span>
          )}
        </div>

        {/* Controls Layout */}
        <div className="mt-6 flex flex-col gap-3.5 w-full">
          <div className="flex gap-2.5">
            {/* North Align Button */}
            <button
              onClick={() => setMode('north')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-sans font-medium uppercase tracking-[1.5px] transition-all duration-300 ${
                mode === 'north'
                  ? 'bg-steel/30 text-silver border-steel/50'
                  : 'bg-depth text-mist border-steel/10 hover:text-silver hover:bg-steel/15'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 rotate-45" />
              <span>Alinear Norte</span>
            </button>

            {/* Locate Party Button */}
            <button
              onClick={requestLocation}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-sans font-medium uppercase tracking-[1.5px] transition-all duration-300 ${
                mode === 'party'
                  ? 'bg-white text-void border-white'
                  : 'bg-depth text-mist border-steel/10 hover:text-silver hover:bg-steel/15'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Cómo llegar</span>
            </button>
          </div>

          {/* Inline geolocation description / distance result */}
          {geoState.status === 'locating' && (
            <div className="text-center font-mono text-[11px] text-silver/70 animate-pulse py-1">
              Obteniendo tu señal de satélite...
            </div>
          )}

          {geoState.status === 'error' && (
            <div className="flex items-start gap-1.5 bg-red-950/20 border border-red-900/40 rounded-xl p-2.5 text-left text-[11px] text-red-200/90 leading-relaxed font-sans">
              <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{geoState.errorMsg}</span>
            </div>
          )}

          {geoState.status === 'success' && geoState.distance !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-steel/10 border border-steel/20 rounded-xl p-3 text-center"
            >
              <div className="font-sans text-[10px] uppercase tracking-[2px] text-mist mb-1">Tu Distancia al Destino</div>
              <div className="font-mono text-lg font-semibold text-silver">
                Estás a <span className="text-white font-bold">{geoState.distance.toFixed(1)} km</span> del evento
              </div>
              <div className="font-sans text-[9px] text-mist/70 mt-1">
                La aguja se ha magnetizado para apuntar directo a Cali
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
