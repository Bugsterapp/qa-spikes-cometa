import { useState, useCallback, useRef, useMemo } from 'react';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { TrackEvents } from '/src/constants/events';

export type AttendanceMode = 'manual' | 'ai' | 'unknown';

interface AttendanceTrackingContext {
  scope: 'group' | 'classroom';
  levelId: string;
}

interface UseAttendanceTrackingReturn {
  trackFlowStarted: (context: AttendanceTrackingContext) => void;
  trackModeSelected: (mode: 'manual' | 'ai') => void;
  trackAiRecordingStarted: () => void;
  trackAiRecordingFailed: (errorType: string) => void;
  trackAiResultShown: (matchedCount: number, needsClarification: boolean) => void;
  trackSubmitClicked: (sessionId?: string) => void;
  trackFlowExited: (reason: 'back') => void;
  getSubmitHeaders: () => Record<string, string>;
  currentMode: AttendanceMode;
  flowId: string;
  hasSubmitted: boolean;
  setHasSubmitted: (value: boolean) => void;
  resetTracking: () => void;
}

export function useAttendanceTracking(): UseAttendanceTrackingReturn {
  const selectedSchool = useSelectedSchool();
  const sendTrackEvent = useSendTrackEventWithUserName();

  const flowIdRef = useRef<string>(crypto.randomUUID());
  const flowStartedAtRef = useRef<string>(new Date().toISOString());
  const contextRef = useRef<AttendanceTrackingContext | null>(null);

  const [currentMode, setCurrentMode] = useState<AttendanceMode>('unknown');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const getCommonProperties = useCallback(
    () => ({
      attendance_flow_id: flowIdRef.current,
      school_id: selectedSchool?.id || '',
      scope: contextRef.current?.scope || 'classroom',
      level_id: contextRef.current?.levelId || '',
      flow_started_at: flowStartedAtRef.current,
    }),
    [selectedSchool?.id]
  );

  const trackFlowStarted = useCallback(
    (context: AttendanceTrackingContext) => {
      contextRef.current = context;
      sendTrackEvent(TrackEvents.attendance.flowStarted, getCommonProperties());
    },
    [sendTrackEvent, getCommonProperties]
  );

  const trackModeSelected = useCallback(
    (mode: 'manual' | 'ai') => {
      setCurrentMode(mode);
      sendTrackEvent(TrackEvents.attendance.modeSelected, {
        ...getCommonProperties(),
        mode,
      });
    },
    [sendTrackEvent, getCommonProperties]
  );

  const trackAiRecordingStarted = useCallback(() => {
    sendTrackEvent(TrackEvents.attendance.aiRecordingStarted, getCommonProperties());
  }, [sendTrackEvent, getCommonProperties]);

  const trackAiRecordingFailed = useCallback(
    (errorType: string) => {
      sendTrackEvent(TrackEvents.attendance.aiRecordingFailed, {
        ...getCommonProperties(),
        error_type: errorType,
      });
    },
    [sendTrackEvent, getCommonProperties]
  );

  const trackAiResultShown = useCallback(
    (matchedCount: number, needsClarification: boolean) => {
      sendTrackEvent(TrackEvents.attendance.aiResultShown, {
        ...getCommonProperties(),
        matched_count: matchedCount,
        needs_clarification: needsClarification,
      });
    },
    [sendTrackEvent, getCommonProperties]
  );

  const trackSubmitClicked = useCallback(
    (sessionId?: string) => {
      setHasSubmitted(true);
      sendTrackEvent(TrackEvents.attendance.submitClicked, {
        ...getCommonProperties(),
        session_id: sessionId,
        mode: currentMode,
      });
    },
    [sendTrackEvent, getCommonProperties, currentMode]
  );

  const trackFlowExited = useCallback(
    (reason: 'back') => {
      if (hasSubmitted) return;

      sendTrackEvent(TrackEvents.attendance.flowExited, {
        ...getCommonProperties(),
        reason,
        last_mode: currentMode,
      });
    },
    [sendTrackEvent, getCommonProperties, currentMode, hasSubmitted]
  );

  const getSubmitHeaders = useCallback(
    () => ({
      'X-Attendance-Mode': currentMode,
      'X-Attendance-Flow-Id': flowIdRef.current,
      'X-Attendance-Flow-Started-At': flowStartedAtRef.current,
    }),
    [currentMode]
  );

  const resetTracking = useCallback(() => {
    flowIdRef.current = crypto.randomUUID();
    flowStartedAtRef.current = new Date().toISOString();
    contextRef.current = null;
    setCurrentMode('unknown');
    setHasSubmitted(false);
  }, []);

  return useMemo(
    () => ({
      trackFlowStarted,
      trackModeSelected,
      trackAiRecordingStarted,
      trackAiRecordingFailed,
      trackAiResultShown,
      trackSubmitClicked,
      trackFlowExited,
      getSubmitHeaders,
      currentMode,
      flowId: flowIdRef.current,
      hasSubmitted,
      setHasSubmitted,
      resetTracking,
    }),
    [
      trackFlowStarted,
      trackModeSelected,
      trackAiRecordingStarted,
      trackAiRecordingFailed,
      trackAiResultShown,
      trackSubmitClicked,
      trackFlowExited,
      getSubmitHeaders,
      currentMode,
      hasSubmitted,
      resetTracking,
    ]
  );
}
