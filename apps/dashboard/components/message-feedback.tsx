'use client';

import { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { cn } from '@cometa/utils';
import ConfettiJS from 'confetti-js';

type FeedbackLabel = 'positive' | 'negative';

interface MessageFeedbackProps {
  messageId: string;
  messageText: string;
  analyticsData?: {
    query?: string;
    answer?: string;
  };
  sessionId: string;
  userId: string;
  className?: string;
}

export const MessageFeedback = ({
  messageId,
  messageText,
  analyticsData,
  sessionId,
  userId,
  className,
}: MessageFeedbackProps) => {
  const [selectedLabel, setSelectedLabel] = useState<FeedbackLabel | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleThumbClick = (label: FeedbackLabel) => {
    if (isSubmitted || isSubmitting) return;
    setSelectedLabel(label);
  };

  const buildSuggestion = () => {
    let suggestion = messageText;

    if (analyticsData?.query && analyticsData?.answer) {
      suggestion += `\n\nAnalytics Query: ${analyticsData.query}\nAnalytics Answer: ${analyticsData.answer}`;
    }

    return suggestion;
  };

  const handleSubmit = async () => {
    if (!selectedLabel || isSubmitting || isSubmitted) return;

    setIsSubmitting(true);

    try {
      const uniqueFeedbackId = `${messageId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const payload = {
        ai_response_id: uniqueFeedbackId,
        messageId: messageId,
        userId: userId,
        comments: comment.trim(),
        label: selectedLabel,
        agentSid: sessionId,
        conversationId: sessionId,
        suggestion: buildSuggestion(),
        model: 'claude-sonnet-4-5',
        Created: new Date().toISOString(),
      };

      await fetch('https://n8n-ai.prd.getcometa.com/webhook/ec218030-9cdc-4da9-b731-f1e04a4b5af1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setIsSubmitted(true);
      setIsSubmitting(false);

      if (selectedLabel === 'positive') {
        setShowConfetti(true);
      }

      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedLabel(null);
        setComment('');
        setShowConfetti(false);
      }, 2500);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showConfetti && canvasRef.current) {
      const confettiSettings = {
        target: canvasRef.current,
        respawn: false,
        rotate: true,
        max: 60,
        clock: 35,
        size: 1,
      };

      const confetti = new ConfettiJS(confettiSettings);
      confetti.render();

      return () => {
        confetti.clear();
      };
    }
  }, [showConfetti]);

  return (
    <div className={cn('mt-2 flex flex-col gap-2 relative', className)}>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => handleThumbClick('positive')}
          disabled={isSubmitting || isSubmitted}
          className={cn(
            'relative flex items-center justify-center w-8 h-8 rounded-lg transition-all',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            selectedLabel === 'positive' && !isSubmitted && 'bg-green-50 dark:bg-green-900/20',
            isSubmitted && selectedLabel === 'positive' && 'bg-green-100 dark:bg-green-900/30',
            (isSubmitting || isSubmitted) && 'cursor-not-allowed'
          )}
          whileTap={!isSubmitting && !isSubmitted ? { scale: 0.95 } : {}}
        >
          <motion.div
            style={{ transformOrigin: 'left center' }}
            animate={
              isSubmitted && selectedLabel === 'positive'
                ? {
                    rotate: [0, -25, 0, 8, 0],
                    y: [0, -4, 0, 1, 0],
                  }
                : {}
            }
            transition={{
              duration: 1,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <ThumbsUp
              className={cn(
                'w-4 h-4 transition-colors',
                selectedLabel === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
              )}
            />
          </motion.div>
        </motion.button>

        <motion.button
          onClick={() => handleThumbClick('negative')}
          disabled={isSubmitting || isSubmitted}
          className={cn(
            'relative flex items-center justify-center w-8 h-8 rounded-lg transition-all',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            selectedLabel === 'negative' && !isSubmitted && 'bg-red-50 dark:bg-red-900/20',
            isSubmitted && selectedLabel === 'negative' && 'bg-red-100 dark:bg-red-900/30',
            (isSubmitting || isSubmitted) && 'cursor-not-allowed'
          )}
          whileTap={!isSubmitting && !isSubmitted ? { scale: 0.95 } : {}}
        >
          <motion.div
            animate={
              isSubmitted && selectedLabel === 'negative'
                ? {
                    y: [0, 4, -1, 4, 0],
                  }
                : {}
            }
            transition={{
              duration: 0.7,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <ThumbsDown
              className={cn(
                'w-4 h-4 transition-colors',
                selectedLabel === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
              )}
            />
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {selectedLabel && !isSubmitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Agregar comentario (opcional)..."
              disabled={isSubmitting}
              className="min-h-[80px] text-sm resize-none rounded-xl border-gray-200 dark:border-gray-700"
            />
            <Button onClick={handleSubmit} disabled={isSubmitting} size="sm" className="self-end rounded-lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar feedback'
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {showConfetti && (
        <canvas
          ref={canvasRef}
          className="absolute pointer-events-none z-50"
          style={{
            width: '200px',
            height: '200px',
            left: '-80px',
            top: '-80px',
          }}
        />
      )}
    </div>
  );
};
