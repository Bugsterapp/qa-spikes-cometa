type EmojiProps = {
  symbol: string;
  label?: string;
  className?: string;
};

export function Emoji({ symbol, label, className }: EmojiProps) {
  return (
    <span
      className={className}
      role="img"
      aria-label={label ? label : undefined}
      aria-hidden={label ? 'false' : 'true'}
    >
      {symbol}
    </span>
  );
}
