import React, { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@cometa/recreo/components/ui/Popover';
import { Smile, Search } from 'lucide-react';
import { emojis, type EmojiItem } from '@tiptap/extension-emoji';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmojis = useMemo(() => {
    if (!searchQuery) {
      return emojis;
    }

    const query = searchQuery.toLowerCase();
    return emojis
      .filter(
        (emoji: EmojiItem) =>
          emoji.name.toLowerCase().includes(query) ||
          emoji.shortcodes.some((shortcode: string) => shortcode.toLowerCase().includes(query)) ||
          emoji.tags.some((tag: string) => tag.toLowerCase().includes(query))
      )
      .slice(0, 64);
  }, [searchQuery]);

  const handleEmojiClick = (emoji: EmojiItem) => {
    onEmojiSelect(emoji.emoji || '');
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSearchQuery('');
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative shrink-0 flex items-center justify-center size-6 hover:opacity-100 transition-opacity opacity-60"
        >
          <Smile className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg"
        align="start"
        sideOffset={8}
      >
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Seleccionar emoji</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar emoji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto overflow-x-hidden">
          {filteredEmojis.map((emoji: EmojiItem) => (
            <button
              key={emoji.name}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
              title={`${emoji.name} - ${emoji.shortcodes.join(', ')}`}
            >
              {emoji.emoji}
            </button>
          ))}
        </div>
        {filteredEmojis.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">No se encontraron emojis</div>
        )}
      </PopoverContent>
    </Popover>
  );
};
