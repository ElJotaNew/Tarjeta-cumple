import { motion } from 'motion/react';
import { Mail, Heart } from 'lucide-react';

export default function EnvelopeRain() {
  return (
    <div className="w-full max-w-sm mt-6 px-4">
      <div className="relative rounded-3xl bg-depth/30 border border-steel/15 backdrop-blur-md p-6 shadow-xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-steel/5 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center">
          <Mail className="w-5 h-5 text-mist mx-auto mb-2" />
          <h2 className="font-serif text-lg tracking-[3.5px] uppercase text-silver">Lluvia de Sobres</h2>
          <p className="text-[9px] text-mist tracking-widest uppercase mt-0.5">Tradición y presentes</p>
        </div>

        <div className="flex flex-col gap-4 text-center mt-5">
          <div className="flex justify-center items-center gap-1.5 font-sans text-[11px] text-mist/70 uppercase">
            <Heart className="w-3.5 h-3.5 text-red-400/60" />
            <span>¡Tu presencia es mi mayor regalo!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
