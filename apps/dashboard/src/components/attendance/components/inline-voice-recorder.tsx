import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useVoiceRecorder } from '../hooks/use-voice-recorder';
import { Loader2, Square, Mic, SparklesIcon } from 'lucide-react';
import { cn } from '@cometa/utils';

type InlineVoiceRecorderProps = {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onRecordingStarted?: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function InlineVoiceRecorder({
  onRecordingComplete,
  onRecordingStarted,
  disabled = false,
  isProcessing = false,
}: InlineVoiceRecorderProps) {
  const { state, recordingTime, audioLevel, startRecording, stopRecording, resetRecording } = useVoiceRecorder({
    onRecordingComplete,
  });

  useEffect(() => {
    if (state === 'recorded') {
      const timer = setTimeout(() => {
        resetRecording();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state, resetRecording]);

  function handleClick() {
    if (isProcessing) return;
    if (state === 'idle' || state === 'denied') {
      startRecording();
      onRecordingStarted?.();
    } else if (state === 'recording') {
      stopRecording();
    }
  }

  const isRecording = state === 'recording';
  const isRequesting = state === 'requesting';

  const microphoneIcon = isProcessing ? (
    <Loader2 className="w-6 h-6 text-white animate-spin" />
  ) : isRecording ? (
    <Square className="w-6 h-6 text-white" />
  ) : (
    <Mic className="w-6 h-6 text-white" />
  );

  const statusTitle = isProcessing ? 'Procesando...' : isRecording ? 'Grabando...' : 'Dictar inasistencia';

  const statusDescription = isProcessing
    ? 'Cometa AI está procesando el audio...'
    : isRecording
    ? `${formatTime(recordingTime)} - Haz clic para detener`
    : 'Di los nombres y Cometa AI los marcará por ti.';

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isRequesting || isProcessing}
      className="w-full bg-pink-50 border border-pink-200 rounded-lg p-4 flex items-center justify-between hover:bg-pink-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 flex items-center justify-center">
          {isRecording && (
            <>
              <motion.div
                className="absolute w-12 h-12 rounded-lg bg-pink-400/35"
                animate={{
                  scale: 1 + audioLevel * 2,
                }}
                transition={{
                  duration: 0.05,
                  ease: 'easeOut',
                }}
              />
              <motion.div
                className="absolute w-12 h-12 rounded-lg bg-pink-400/20"
                animate={{
                  scale: 1 + audioLevel * 3,
                }}
                transition={{
                  duration: 0.05,
                  ease: 'easeOut',
                }}
              />
            </>
          )}

          <div
            className={cn(
              'relative w-12 h-12 rounded-lg flex items-center justify-center z-10',
              isProcessing ? 'bg-pink-400' : isRecording ? 'bg-pink-600' : 'bg-pink-500'
            )}
          >
            {microphoneIcon}
          </div>

          {isRecording && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>

        <div className="text-left">
          <h4 className="font-semibold text-pink-900">{statusTitle}</h4>
          <p className="text-sm text-pink-700">{statusDescription}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-pink-600">
        <span className="text-sm font-semibold">Cometa AI</span>
        <SparklesIcon className="w-4 h-4" />
      </div>
    </button>
  );
}
