import React from 'react';

export function HighlightMatch({
  children,
  query,
  className,
  title,
}: {
  children: React.ReactNode;
  query: string;
  className?: string;
  title?: string;
}) {
  const highlight = (text: string) => highlightMatch(text, query);

  return (
    <span className={className} title={title}>
      {React.Children.map(children, (child) => (typeof child === 'string' ? highlight(child) : child))}
    </span>
  );
}
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);
  const regex = new RegExp(`(${normalizedQuery})`, 'gi');
  const matchIndices: Array<[number, number]> = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(normalizedText)) !== null) {
    matchIndices.push([match.index, match.index + match[1].length]);
  }

  if (matchIndices.length === 0) return text;

  const parts: Array<string> = [];
  let lastIndex = 0;

  matchIndices.forEach(([start, end]) => {
    parts.push(text.slice(lastIndex, start));
    parts.push(text.slice(start, end));
    lastIndex = end;
  });

  parts.push(text.slice(lastIndex));

  return (
    <span>
      {parts.map((part, index) =>
        normalize(part).toLowerCase() === normalizedQuery.toLowerCase() ? (
          <span key={index} className="bg-[#FFF0C4]">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

function normalize(str: string): string {
  return String(str)
    .normalize('NFD') // Decompose Unicode characters
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
}
