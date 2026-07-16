import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  Compass as CompassIcon, 
  ChevronDown, 
  Navigation, 
  Map 
} from 'lucide-react';

// Modular components
import Starfield from './components/Starfield';
import AudioPlayer from './components/AudioPlayer';
import Compass from './components/Compass';
import EnvelopeRain from './components/EnvelopeRain';
import { GeolocationState } from './types';

export default function App() {
  const targetDate = new Date('2026-07-25T16:00:00');
  
  // Geolocation state shared for map action routing
  const [geoState, setGeoState] = useState<GeolocationState>({
    status: 'idle',
    distance: null,
    bearing: null,
  });

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  const venueCoords = { lat: 3.395722, lng: -76.508472 };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / (1000 * 60)) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLocationUpdate = (state: GeolocationState) => {
    setGeoState(state);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center select-none overflow-x-hidden text-silver pb-24">
      {/* Dynamic Cosmic Background */}
      <Starfield />

      {/* Atmospheric Audio Player */}
      <AudioPlayer />

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {/* Nameplate Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full flex justify-between items-center px-6 pt-16 xs:pt-14 sm:pt-8 font-mono text-[10px] tracking-[2.5px] uppercase text-mist"
        >
          <span>Cali, Colombia</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-steel animate-pulse" />
            <span>N.º 018</span>
          </span>
        </motion.header>

        {/* Hero Illustration (Interactive Compass) */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          className="mt-4 sm:mt-6 flex flex-col items-center w-full"
        >
          <Compass 
            venueLat={venueCoords.lat} 
            venueLng={venueCoords.lng} 
            onLocationUpdate={handleLocationUpdate}
          />
        </motion.section>

        {/* Guest of Honor Titles */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 sm:mt-8 text-center px-6"
        >
          <h1 className="font-serif font-light text-[28px] xs:text-[34px] sm:text-[40px] tracking-[6px] xs:tracking-[8px] uppercase text-white leading-tight">
            Jhonatan
          </h1>
        </motion.div>

        {/* Invitation Text Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-4 sm:mt-6 text-center max-w-[280px] xs:max-w-[310px] px-2 xs:px-4"
        >
          <p className="font-sans text-[11px] xs:text-xs leading-relaxed text-silver/90 font-medium">
            Quiero invitarte a celebrar conmigo un día muy especial: mi cumpleaños de 18 años. 🥳🎂
            <br /><br />
            Me haría muy feliz que pudieras acompañarme y compartir un rato lleno de risas, buena compañía y excelentes recuerdos en este paso a la mayoría de edad. Para mí es muy especial contar contigo.
            <br /><br />
            <span className="text-white font-semibold tracking-[0.5px]">¡Nos vemos para pasar una noche inolvidable!</span>
          </p>
        </motion.div>

        {/* Visual Rule (Ticks) */}
        <div className="w-[140px] xs:w-[180px] h-[9px] mt-6 sm:mt-8 border-b border-steel/30 opacity-55"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, var(--color-steel) 0 1px, transparent 1px 13px)',
            backgroundPosition: 'bottom',
            backgroundSize: 'auto 9px',
          }}
        />

        {/* Event Key Details */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-6 sm:mt-8 flex justify-center items-center w-full max-w-[320px] px-4"
        >
          {/* Date Column */}
          <div className="flex-1 flex flex-col items-center text-center">
            <span className="text-[9px] font-mono tracking-widest uppercase text-mist mb-1">Fecha</span>
            <span className="font-mono text-sm xs:text-base font-semibold text-silver tracking-[1px]">25.07.2026</span>
            <span className="text-[8px] text-mist/60 uppercase tracking-[0.5px] mt-0.5">Sábado</span>
          </div>

          {/* Elegant Divider */}
          <div className="w-[1px] h-10 bg-steel/30 mx-4" />

          {/* Hour Column */}
          <div className="flex-1 flex flex-col items-center text-center">
            <span className="text-[9px] font-mono tracking-widest uppercase text-mist mb-1">Hora</span>
            <span className="font-mono text-sm xs:text-base font-semibold text-silver tracking-[1px]">04:00 PM</span>
            <span className="text-[8px] text-mist/60 uppercase tracking-[0.5px] mt-0.5">Atardecer</span>
          </div>
        </motion.section>

        {/* Countdown Timer Block */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-6 sm:mt-8 flex justify-center gap-1.5 xs:gap-2 px-2"
          aria-label="Contador regresivo"
        >
          {[
            { value: timeLeft.days, label: 'Días' },
            { value: timeLeft.hours, label: 'Horas' },
            { value: timeLeft.minutes, label: 'Min' },
            { value: timeLeft.seconds, label: 'Seg' }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative w-[50px] h-[50px] xs:w-[58px] xs:h-[58px] rounded-xl border border-steel/20 bg-depth/40 backdrop-blur-md flex items-center justify-center font-mono text-[18px] xs:text-[22px] font-bold text-white shadow-lg shadow-void/40 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={item.value}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 12, duration: 0.2 }}
                    className="absolute"
                  >
                    {item.value}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="mt-1.5 font-mono text-[8px] xs:text-[9px] uppercase tracking-[1px] xs:tracking-[1.5px] text-mist">
                {item.label}
              </span>
            </div>
          ))}
        </motion.section>

        {/* Envelope Rain Tradition Account Copy Module */}
        <EnvelopeRain />

        {/* Location Map Frame */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-sm mt-10 px-4"
        >
          <div className="rounded-3xl overflow-hidden border border-steel/20 bg-depth/30 backdrop-blur-md p-5 shadow-xl">
            <span className="block text-center text-[10px] font-mono tracking-widest uppercase text-mist mb-4 flex items-center justify-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-steel" />
              <span>Ubicación de la Recepción</span>
            </span>

            {/* Inverted high-end customized map frame */}
            <div className="relative rounded-2xl overflow-hidden border border-steel/15 bg-void">
              <iframe
                className="w-full h-[180px] grayscale invert contrast-[0.95] brightness-[0.85] opacity-80"
                src={`https://maps.google.com/maps?q=${venueCoords.lat},${venueCoords.lng}&z=16&output=embed`}
                loading="lazy"
                title="Google Maps con el lugar del evento"
                referrerPolicy="no-referrer-when-downgrade"
                id="map-iframe"
              />
            </div>

            {/* Action directions */}
            <div className="mt-4 flex w-full">
              {/* Google Maps Link */}
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${venueCoords.lat},${venueCoords.lng}`}
                target="_blank" 
                rel="noopener noreferrer"
                id="google-maps-btn"
                className="w-full py-3 rounded-xl border border-white bg-white hover:bg-silver hover:scale-[1.01] text-void font-sans text-center text-xs font-semibold uppercase tracking-[2.5px] transition-all duration-300 select-none decoration-transparent shadow-lg shadow-white/5 flex items-center justify-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5 text-void shrink-0" />
                <span>Abrir en Google Maps</span>
              </a>
            </div>
          </div>
        </motion.section>

        {/* Footer closing mark */}
        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center select-none"
        >
          <div className="text-[10px] font-mono tracking-[4px] uppercase text-mist/75 animate-pulse">
            Te espero para celebrar
          </div>
          <div className="text-[8px] font-mono tracking-[1px] text-mist/30 mt-3 uppercase">
            © 2026 · Cali, Colombia
          </div>
        </motion.footer>

      </main>
    </div>
  );
}
