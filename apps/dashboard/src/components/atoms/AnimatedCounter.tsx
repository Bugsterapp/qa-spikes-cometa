import { easings, animated, useSpring } from 'react-spring';

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from,
  to,
  duration = 1000,
}: AnimatedCounterProps) => {
  const { number } = useSpring<{ number: number }>({
    number: to,
    from: { number: from },
    config: { duration, easing: easings.easeInOutQuad },
  });

  return <animated.span className="tabular-nums">{number.to((n) => Math.floor(n))}</animated.span>;
};
