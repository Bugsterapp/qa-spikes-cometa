import { CSSProperties } from 'react';

// ----------------------------------------------------------------------

interface SxProp {
  width?: number | string;
  height?: number | string;
  bgcolor?: string;
  [key: string]: any;
}

interface SvgIconStyleProps {
  src: string;
  sx?: SxProp;
  className?: string;
}

export default function SvgIconStyle({ src, sx = {}, className = '' }: SvgIconStyleProps) {
  // Build inline styles from sx prop and base styles
  const buildStyles = (): CSSProperties => {
    // Handle width/height - if they're numeric values of 1 or less, treat as percentage (100%)
    const getSize = (value: number | string | undefined, defaultSize = 24): number | string => {
      if (value === undefined) return defaultSize;
      if (value === 1) return '100%';
      if (typeof value === 'number') return value;
      return value;
    };

    const styles: CSSProperties = {
      width: getSize(sx.width, 24),
      height: getSize(sx.height, 24),
      backgroundColor: 'currentColor',
      mask: `url(${src}) no-repeat center / contain`,
      WebkitMask: `url(${src}) no-repeat center / contain`,
    };

    // Merge additional sx props
    Object.keys(sx).forEach((key) => {
      if (key === 'bgcolor') {
        styles.backgroundColor = sx[key];
      } else if (key === 'width' || key === 'height') {
        // Already handled above
      } else {
        (styles as any)[key] = sx[key];
      }
    });

    return styles;
  };

  return <span className={`inline-block ${className}`} style={buildStyles()} />;
}
