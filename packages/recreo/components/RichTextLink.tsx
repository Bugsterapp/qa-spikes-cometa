import React from 'react';
import { Button } from './ui';

type LinkProps = {
  label: string;
  url: string;
  className?: string;
  key?: string;
};

type RichTextLinkProps = {
  text: string;
  className?: string;
  renderButtonLink?: (props: LinkProps) => React.ReactNode;
  renderTextLink?: (props: LinkProps) => React.ReactNode;
};

function DefaultButtonLink({ label, url, className = '' }: LinkProps) {
  return (
    <Button
      className={className}
      type="button"
      size="small"
      variant="outline"
      color="black"
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
    >
      {label}
    </Button>
  );
}

function DefaultTextLink({ label, url, className = '' }: LinkProps) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`underline text-blue-500 ${className}`}>
      {label}
    </a>
  );
}

export function RichTextLink({
  text,
  className = '',
  renderButtonLink = DefaultButtonLink,
  renderTextLink = DefaultTextLink,
}: RichTextLinkProps) {
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  const parts: React.ReactNode[] = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <p key={`text-${lastIndex}`} className="text-inherit">
          {text.substring(lastIndex, match.index)}
        </p>
      );
    }

    if (match[1]) {
      parts.push(
        renderButtonLink({
          key: `btn-${match.index}`,
          label: match[2],
          url: match[3],
        })
      );
    } else if (match[4]) {
      parts.push(
        renderTextLink({
          key: `link-${match.index}`,
          label: match[4],
          url: match[4],
        })
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(
      <p key={`text-${lastIndex}`} className="text-inherit">
        {text.substring(lastIndex)}
      </p>
    );
  }

  return <div className={`whitespace-pre-wrap ${className}`}>{parts}</div>;
}
