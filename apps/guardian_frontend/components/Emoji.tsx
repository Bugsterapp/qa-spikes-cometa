import React from 'react';

type EmojiProps = {
  symbol: string;
  label?: string;
  className?: string;
};

const Emoji = ({ symbol, label, className }: EmojiProps) => (
  <span className={className} role="img" aria-label={label ? label : undefined} aria-hidden={label ? 'false' : 'true'}>
    {symbol}
  </span>
);
export default Emoji;
