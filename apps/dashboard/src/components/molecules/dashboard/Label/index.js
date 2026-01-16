import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';

// ----------------------------------------------------------------------

const labelVariants = cva('', {
  variants: {
    variant: {
      outlined: 'bg-transparent border',
    },
  },
  compoundVariants: [
    // Default
    { color: 'default', variant: 'filled', class: 'bg-gray-300 text-gray-800' },
    { color: 'default', variant: 'outlined', class: 'text-gray-900 border-gray-400' },
    { color: 'default', variant: 'ghost', class: 'bg-gray-200/25 text-gray-600' },
    // Primary
    { color: 'primary', variant: 'filled', class: 'bg-blue-600 text-white' },
    { color: 'primary', variant: 'outlined', class: 'text-blue-600 border-blue-600' },
    { color: 'primary', variant: 'ghost', class: 'bg-blue-600/16 text-blue-900' },
    // Secondary
    { color: 'secondary', variant: 'filled', class: 'bg-purple-600 text-white' },
    { color: 'secondary', variant: 'outlined', class: 'text-purple-600 border-purple-600' },
    { color: 'secondary', variant: 'ghost', class: 'bg-purple-600/16 text-purple-900' },
    // Info
    { color: 'info', variant: 'filled', class: 'bg-cyan-600 text-white' },
    { color: 'info', variant: 'outlined', class: 'text-cyan-600 border-cyan-600' },
    { color: 'info', variant: 'ghost', class: 'bg-cyan-600/16 text-cyan-900' },
    // Success
    { color: 'success', variant: 'filled', class: 'bg-green-600 text-white' },
    { color: 'success', variant: 'outlined', class: 'text-green-600 border-green-600' },
    { color: 'success', variant: 'ghost', class: 'bg-green-600/16 text-green-900' },
    // Warning
    { color: 'warning', variant: 'filled', class: 'bg-amber-600 text-white' },
    { color: 'warning', variant: 'outlined', class: 'text-amber-600 border-amber-600' },
    { color: 'warning', variant: 'ghost', class: 'bg-amber-600/16 text-amber-900' },
    // Error
    { color: 'error', variant: 'filled', class: 'bg-red-600 text-white' },
    { color: 'error', variant: 'outlined', class: 'text-red-600 border-red-600' },
    { color: 'error', variant: 'ghost', class: 'bg-red-600/16 text-red-900' },
    // Medium
    { color: 'medium', variant: 'filled', class: 'bg-gray-500 text-white' },
    { color: 'medium', variant: 'outlined', class: 'text-gray-500 border-gray-500' },
    { color: 'medium', variant: 'ghost', class: 'bg-gray-500/16 text-gray-700' },
  ],
  defaultVariants: {
    color: 'default',
    variant: 'ghost',
  },
});

// ----------------------------------------------------------------------

Label.propTypes = {
  children: PropTypes.node,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error', 'medium']),
  variant: PropTypes.oneOf(['filled', 'outlined', 'ghost']),
  sx: PropTypes.object,
  styledColor: PropTypes.bool,
  styledBackground: PropTypes.bool,
  backgroundColor: PropTypes.string,
  className: PropTypes.string,
};

export default function Label({
  children,
  color = 'default',
  variant = 'ghost',
  startIcon = undefined,
  endIcon = undefined,
  sx = {},
  styledColor = false,
  styledBackground = false,
  backgroundColor = '',
  className = '',
}) {
  // Build inline styles from sx prop and custom colors
  const buildStyles = () => {
    const styles = {};

    if (styledColor && styledBackground && backgroundColor) {
      styles.backgroundColor = backgroundColor;
    } else if (color === 'morosidad' && backgroundColor) {
      styles.backgroundColor = backgroundColor;
    }

    // Handle sx prop styles
    if (sx.color) styles.color = sx.color;
    if (sx.backgroundColor) styles.backgroundColor = sx.backgroundColor;
    if (sx.borderColor) styles.borderColor = sx.borderColor;

    return styles;
  };

  return (
    <span
      className={labelVariants({
        color: styledColor && styledBackground ? undefined : color,
        variant: styledColor && styledBackground ? undefined : variant,
        className: `
          inline-flex items-center justify-center
          h-[22px] leading-none rounded-md cursor-default whitespace-nowrap
          px-2 text-xs font-bold
          ${startIcon ? 'pl-3' : ''}
          ${endIcon ? 'pr-3' : ''}
          ${className}
        `
          .trim()
          .replace(/\s+/g, ' '),
      })}
      style={buildStyles()}
    >
      {startIcon && (
        <div className="mr-3 w-4 h-4 flex items-center justify-center">
          <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>img]:w-full [&>img]:h-full [&>img]:object-cover">
            {startIcon}
          </div>
        </div>
      )}

      {children}

      {endIcon && (
        <div className="ml-3 w-4 h-4 flex items-center justify-center">
          <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>img]:w-full [&>img]:h-full [&>img]:object-cover">
            {endIcon}
          </div>
        </div>
      )}
    </span>
  );
}
