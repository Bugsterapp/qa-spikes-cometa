import { Button } from '@cometa/recreo/v2';
import { MicIcon, StopCircleIcon, DownloadIcon, RefreshCwIcon, AlertTriangleIcon, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVoiceRecorder } from '../hooks/use-voice-recorder';

type VoiceRecorderProps = {
  onRecordingComplete?: (audioBlob: Blob) => void;
  maxDuration?: number;
  disabled?: boolean;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function VoiceRecorder({ onRecordingComplete, maxDuration = 300, disabled = false }: VoiceRecorderProps) {
  const {
    state,
    audioUrl,
    recordingTime,
    audioLevel,
    startRecording,
    stopRecording,
    resetRecording,
    downloadRecording,
  } = useVoiceRecorder({ onRecordingComplete });

  // Permission denied state
  if (state === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso al micrófono denegado</h3>
            <p className="text-sm text-gray-600 mb-4">
              Debes permitir el acceso al micrófono para poder grabar audio. Por favor, verifica la configuración de
              permisos de tu navegador.
            </p>
          </div>
          <Button onClick={startRecording} variant="outline">
            Solicitar permisos nuevamente
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <MicIcon className="w-12 h-12 text-primary" />
          </div>
          <Button onClick={startRecording} size="lg" disabled={disabled}>
            <MicIcon className="w-4 h-4 mr-2" />
            Grabar
          </Button>
          <p className="text-sm text-gray-500">Haz clic para comenzar a grabar</p>
        </div>
      </div>
    );
  }

  if (state === 'requesting') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <MicIcon className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-sm text-gray-600">Solicitando permisos...</p>
        </div>
      </div>
    );
  }

  if (state === 'recording') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute w-40 h-40 rounded-full bg-primary/10"
              animate={{
                scale: audioLevel > 0.05 ? 1 + audioLevel * 1.5 : 0.8,
              }}
              transition={{
                duration: 0.05,
                ease: 'easeOut',
              }}
            />

            <motion.div
              className="absolute w-32 h-32 rounded-full bg-primary/30"
              animate={{
                scale: audioLevel > 0.05 ? 1 + audioLevel * 1.2 : 0.85,
              }}
              transition={{
                duration: 0.05,
                ease: 'easeOut',
              }}
            />

            <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center z-10">
              <MicIcon className="w-10 h-10 text-white" />
            </div>

            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">{formatTime(recordingTime)}</p>
            <p className="text-sm text-gray-500">Grabando...</p>
            {maxDuration && <p className="text-xs text-gray-400 mt-1">Máximo: {formatTime(maxDuration)}</p>}
          </div>

          <Button onClick={stopRecording} variant="destructive" size="lg">
            <StopCircleIcon className="w-4 h-4 mr-2" />
            Detener
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'recorded' && audioUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Grabación completada</h3>
            <p className="text-sm text-gray-500">Duración: {formatTime(recordingTime)}</p>
          </div>

          <div className="w-full">
            <audio controls src={audioUrl} className="w-full" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button onClick={downloadRecording} variant="default" className="flex-1" disabled={disabled}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Descargar audio
            </Button>
            <Button onClick={resetRecording} variant="outline" className="flex-1" disabled={disabled}>
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Volver a grabar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
