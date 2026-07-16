import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);
  const intervalIdRef = useRef<number | null>(null);

  // Scaled tones (Pentatonic C major) - pleasant, atmospheric
  const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

  // Initialize Audio Context & Nodes
  const startAudio = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Analyser for the canvas visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      // Master output node with a lowpass filter to keep it soft
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      // Delay Node for beautiful cosmic echo
      const delay = ctx.createDelay(1.0);
      delay.delayTime.setValueAtTime(0.4, ctx.currentTime);

      const feedback = ctx.createGain();
      feedback.gain.setValueAtTime(0.5, ctx.currentTime);

      // Connect delay loop
      delay.connect(feedback);
      feedback.connect(delay);

      // Connect to destination
      analyser.connect(ctx.destination);
      filter.connect(analyser);
      delay.connect(filter);

      // Helper to play a chime / bell sound
      const playChime = (freq: number, duration = 3.0, volume = 0.15) => {
        if (!audioContextRef.current || audioContextRef.current.state === 'suspended') return;
        const now = audioContextRef.current.currentTime;

        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();

        // High-quality sine-bell tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Exponential decay envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(filter);
        gain.connect(delay); // Send to delay for spacey echo

        osc.start(now);
        osc.stop(now + duration + 0.5);

        // Keep track to clean up
        activeNodesRef.current.push(osc, gain);
      };

      // Play soft base drone
      const playDrone = () => {
        if (!audioContextRef.current) return;
        const now = audioContextRef.current.currentTime;

        // Play gentle major 7th chord drone
        const droneFreqs = [130.81, 196.00, 246.94, 329.63]; // C3, G3, B3, E4
        droneFreqs.forEach((freq, idx) => {
          const osc = audioContextRef.current!.createOscillator();
          const gain = audioContextRef.current!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          // Very soft drone envelope
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.02, now + 1.0);

          osc.connect(gain);
          gain.connect(filter);

          osc.start(now);
          activeNodesRef.current.push(osc, gain);
        });
      };

      // Play introductory chords
      playDrone();
      playChime(523.25, 4.0, 0.12); // C5
      setTimeout(() => playChime(659.25, 4.0, 0.08), 800); // E5
      setTimeout(() => playChime(783.99, 4.0, 0.06), 1600); // G5

      // Schedule periodic random ambient bells
      const chimeInterval = setInterval(() => {
        const randomNote = scale[Math.floor(Math.random() * scale.length)];
        const duration = Math.random() * 3 + 3; // 3 to 6 seconds decay
        const vol = Math.random() * 0.08 + 0.05;
        playChime(randomNote, duration, vol);
      }, 2400);

      intervalIdRef.current = chimeInterval as any;

      setIsPlaying(true);
      drawVisualizer();

    } catch (e) {
      console.error('Failed to initialize local synthesizer:', e);
    }
  };

  // Stop synthesizer
  const stopAudio = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    activeNodesRef.current.forEach((node) => {
      try {
        if ('stop' in node) {
          (node as OscillatorNode).stop();
        }
      } catch (e) {}
    });
    activeNodesRef.current = [];

    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsPlaying(false);
    clearCanvas();
  };

  // Canvas visualizer loop
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      analyserRef.current!.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(147, 167, 187, 0.6)'; // --color-mist
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255.0;
        const y = height / 2 + (v * height / 2) * (i % 2 === 0 ? 1 : -1) * 0.8;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(77, 103, 134, 0.3)'; // faint --color-steel
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const handleToggle = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Autoplay music on first user interaction gesture
  useEffect(() => {
    const handleGesture = () => {
      // Create and start audio context on first user click/touch
      startAudio();
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('touchstart', handleGesture);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    clearCanvas();
    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div 
      id="ambient-audio-player"
      className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-full bg-depth/80 border border-steel/30 px-3 py-1.5 shadow-lg backdrop-blur-md select-none transition-all duration-300 hover:border-steel/60"
    >
      <div className="flex flex-col items-end">
        <span className="text-[9px] uppercase tracking-[2px] text-mist font-medium leading-none mb-0.5">Música</span>
        <span className="text-[8px] uppercase tracking-[1px] text-silver/60 font-mono leading-none">Ambiental</span>
      </div>

      <div className="w-14 h-6 overflow-hidden">
        <canvas ref={canvasRef} width={56} height={24} className="w-full h-full" />
      </div>

      <button
        onClick={handleToggle}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-silver ${
          isPlaying 
            ? 'bg-steel/30 text-silver shadow-inner animate-pulse' 
            : 'bg-depth text-mist hover:text-silver hover:bg-steel/10'
        }`}
        title={isPlaying ? "Silenciar música celestial" : "Activar música celestial"}
        aria-label={isPlaying ? "Silenciar música celestial" : "Activar música celestial"}
      >
        {isPlaying ? (
          <Volume2 className="h-4.5 w-4.5 text-silver" />
        ) : (
          <VolumeX className="h-4.5 w-4.5 text-mist" />
        )}
      </button>
    </div>
  );
}
