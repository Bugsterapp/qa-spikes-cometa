export type ChipProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};
export const Chip: React.FC<ChipProps> = ({ label, value, onChange, disabled }) => (
  <button
    className="bg-white text-green text-xs px-3 py-1.5 border border-green rounded-full hover:bg-green hover:text-white transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-400 cursor:disabled"
    disabled={disabled}
    type="button"
    onClick={() => onChange(value)}
  >
    {label}
  </button>
);
