import Image from 'next/image';
import { BANK_CONFIG } from '../../../constants/banks';

type BankLogoProps = {
  bankName: string;
  size?: number;
  className?: string;
};

export function BankLogo({ bankName, size = 48, className = '' }: Readonly<BankLogoProps>) {
  const bankImagePath = getBankLogoPath(bankName);

  return (
    <div className={`shrink-0 rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {bankImagePath ? (
        <Image
          src={bankImagePath}
          alt={`${bankName} logo`}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#f3ebff] flex items-center justify-center rounded-full">
          <span className="text-[#873aff] text-[14px] font-semibold font-['Lota_Grotesque'] leading-[20px]">
            {getBankInitials(bankName)}
          </span>
        </div>
      )}
    </div>
  );
}

function getBankLogoPath(bankName: string): string | null {
  const config = BANK_CONFIG[bankName];
  return config?.logoPath || null;
}

function getBankInitials(bankName: string): string {
  const words = bankName.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  } else {
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  }
}
