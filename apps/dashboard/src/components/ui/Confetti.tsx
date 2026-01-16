import { useEffect, useRef } from 'react';
import ConfettiJS from 'confetti-js';

interface ConfettiProps {
  topOffset?: number;
}

const Confetti: React.FC<ConfettiProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const confettiSettings = {
      target: canvasRef.current,
      respawn: false,
      rotate: true,
      max: 850,
      clock: 30,
    };

    const confetti = new ConfettiJS(confettiSettings);
    confetti.render();

    return () => {
      confetti.clear();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute left-0 z-0 max-w-[100vw] max-h-[calc(100vh-40px)]" />;
};

export default Confetti;
