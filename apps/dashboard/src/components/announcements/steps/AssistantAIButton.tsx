'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Wand2, FileText, X, Loader2, Sparkles } from 'lucide-react';
import { useSendEvent } from '/src/hooks/useSendEvent';
import { TrackEvents } from '/src/constants/events';

interface AssistantAIButtonProps {
  isLoading?: boolean;
  handleGenerateText?: () => void;
  handleImproveText?: () => void;
  handleSummarizeText?: () => void;
  onComplete?: () => void;
  onPrompt?: () => void;
}

export default function AssistantAIButton({
  isLoading = false,
  handleGenerateText,
  handleImproveText,
  handleSummarizeText,
}: AssistantAIButtonProps) {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const sendEvent = useSendEvent();

  const toggleToolbar = useCallback(() => {
    sendEvent(TrackEvents.announcements.aiIntentionClicked);
    if (!isLoading) {
      setIsToolbarOpen((prev) => !prev);
    }
  }, [isLoading]);

  const toolbarItems = useMemo(
    () => [
      {
        icon: CheckCircle,
        label: 'Completar',
        shortcut: '⌘ 1',
        action: handleGenerateText,
      },
      {
        icon: Wand2,
        label: 'Mejorar',
        shortcut: '⌘ 2',
        action: handleImproveText,
      },
      {
        icon: FileText,
        label: 'Resumir',
        shortcut: '⌘ 3',
        action: handleSummarizeText,
      },
    ],
    [handleGenerateText, handleImproveText, handleSummarizeText]
  );

  const handleToolbarAction = useCallback((action?: () => void, label?: string) => {
    if (action) {
      sendEvent(TrackEvents.announcements.aiOptionSubmitted, { action: label });
      action();
      setIsToolbarOpen(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === 'e') {
        event.preventDefault();
        toggleToolbar();
        return;
      }

      if (isToolbarOpen) {
        const shortcut = toolbarItems.find((item) => {
          const [modifier, key] = item.shortcut.split(' ');
          if (modifier === '⌘' && event.metaKey && event.key === key) {
            return true;
          }
          return false;
        });

        if (shortcut && shortcut.action) {
          event.preventDefault();
          handleToolbarAction(shortcut.action);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, toggleToolbar, isToolbarOpen, toolbarItems, handleToolbarAction]);

  return (
    <div className="relative">
      {/* Toolbar - positioned above the button */}
      <AnimatePresence>
        {isToolbarOpen && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              duration: 0.2,
            }}
            className="absolute bottom-full right-0 mb-2 z-50"
          >
            <div
              className="backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-1 shadow-xl border border-white border-opacity-10"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {toolbarItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleToolbarAction(item.action, item.label)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white text-opacity-90 hover:text-white transition-all duration-200 text-xs font-medium group"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="text-xs text-white text-opacity-40 group-hover:text-opacity-60 hidden md:inline">
                    {item.shortcut}
                  </span>
                </motion.button>
              ))}

              {/* Close button */}
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  sendEvent(TrackEvents.announcements.aiIntentionClosed);
                  toggleToolbar();
                }}
                className="ml-1 p-1.5 rounded-lg text-white text-opacity-70 hover:text-white transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggleToolbar}
        disabled={isLoading}
        className="relative size-6 flex items-center justify-center hover:opacity-80 transition-opacity duration-200 disabled:cursor-not-allowed"
        whileHover={!isLoading ? { scale: 1.1 } : {}}
        whileTap={!isLoading ? { scale: 0.95 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          >
            <Loader2 className="w-6 h-6 text-gray-500" />
          </motion.div>
        ) : (
          <Sparkles className="w-6 h-6 text-gray-500" />
        )}
      </motion.button>
    </div>
  );
}
