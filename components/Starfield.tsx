import { useEffect, useState, useRef } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export default function Starfield() {
  const [stars, setStars] = useState<Star[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Generate star field
    const generatedStars: Star[] = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 2,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setStars(generatedStars);

    // Track mouse position for parallax
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / innerWidth * 25; // max 25px displacement
      const y = (e.clientY - innerHeight / 2) / innerHeight * 25;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden bg-void select-none pointer-events-none transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${mouseOffset.x * -0.4}px, ${mouseOffset.y * -0.4}px, 0)`,
      }}
    >
      {/* Soft Nebula Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-40 bg-radial-gradient from-depth/50 via-void to-void" />
      <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-steel/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-[5%] w-[350px] h-[350px] rounded-full bg-depth/40 blur-[100px] pointer-events-none" />

      {/* Twinkling Star Elements */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-steel) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-steel) 1px, transparent 1px)
          `,
          backgroundSize: '46px 46px',
        }}
      />
    </div>
  );
}
