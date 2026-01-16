import { cn } from '@cometa/utils';
import { CREDENTIAL_DIMENSIONS, type CredentialOrientation } from '../types';

type CredentialMockupProps = {
  children: React.ReactNode;
  orientation?: CredentialOrientation;
  className?: string;
};

export function CredentialMockup({ children, orientation = 'portrait', className = '' }: CredentialMockupProps) {
  const dimensions = CREDENTIAL_DIMENSIONS[orientation];

  return (
    <div
      className={cn('relative', className)}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="rounded-lg shadow-xl relative z-10 overflow-hidden"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>

      <div
        className="absolute inset-0 bg-black opacity-10 rounded-lg transform translate-y-1 -z-10"
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    </div>
  );
}
