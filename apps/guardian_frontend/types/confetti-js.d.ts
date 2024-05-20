declare module 'confetti-js' {
  type ConfettiShape = 'circle' | 'square';
  type ConfettiSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type ConfettiColors = string[] | string;

  interface ConfettiOptions {
    target?: string | HTMLElement;
    max?: number;
    size?: number;
    animate?: boolean;
    respawn?: boolean;
    clock?: number;
    props?: ('circle' | 'square' | 'triangle' | 'line' | 'svg')[];
    colors?: string[][];
    start_from_edge?: boolean;
    width?: number;
    height?: number;
    rotate?: boolean;
  }

  class Confetti {
    constructor(options: ConfettiOptions);

    render(): void;

    clear(): void;
  }

  export default Confetti;
}
