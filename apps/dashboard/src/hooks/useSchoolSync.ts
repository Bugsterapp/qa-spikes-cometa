import { useEffect, useRef } from 'react';
import { useSetSelectedSchool, useSelectedSchoolId } from '../guards/AuthGuard';
import * as Sentry from '@sentry/nextjs';
const BROADCAST_CHANNEL_NAME = 'school-sync';
const STORAGE_KEY = 'globalStore';

type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

const detectStorageSupport = (): StorageType => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return 'localStorage';
  } catch {
    try {
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return 'sessionStorage';
    } catch {
      return 'memory';
    }
  }
};

export const useSchoolSync = (onSchoolChange?: (schoolId: string) => void) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const storageType = useRef<StorageType>(detectStorageSupport());
  const setSelectedSchool = useSetSelectedSchool();
  const currentSchoolId = useSelectedSchoolId();
  const onSchoolChangeRef = useRef(onSchoolChange);

  // Feature flag to enable/disable cross-tab school synchronization.
  const isSchoolSyncEnabled = process.env.NEXT_PUBLIC_ENABLE_SCHOOL_SYNC !== 'false';

  useEffect(() => {
    onSchoolChangeRef.current = onSchoolChange;
  }, [onSchoolChange]);

  useEffect(() => {
    // Skip synchronization if feature is disabled
    if (!isSchoolSyncEnabled) {
      return;
    }

    const currentStorageType = storageType.current;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;

      try {
        const newState = JSON.parse(event.newValue);
        const newSchoolId = newState.state?.selectedSchool;

        if (newSchoolId && newSchoolId !== currentSchoolId) {
          setSelectedSchool(newSchoolId);
          onSchoolChangeRef.current?.(newSchoolId);
        }
      } catch (error) {
        Sentry.captureException(new Error('Failed to parse storage event:'), {
          extra: { error },
        });
      }
    };

    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SCHOOL_CHANGED') {
        const newSchoolId = event.data.schoolId;
        if (newSchoolId && newSchoolId !== currentSchoolId) {
          setSelectedSchool(newSchoolId);
          onSchoolChangeRef.current?.(newSchoolId);
        }
      }
    };

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channelRef.current.onmessage = handleBroadcastMessage;
      } catch (error) {
        Sentry.captureException(new Error('BroadcastChannel not supported, falling back to storage events:'), {
          extra: { error },
        });
      }
    }

    if (currentStorageType === 'localStorage') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      if (currentStorageType === 'localStorage') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [currentSchoolId, setSelectedSchool]);

  const broadcastSchoolChange = (schoolId: string) => {
    // Skip broadcasting if feature is disabled
    if (!isSchoolSyncEnabled) {
      return false;
    }

    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type: 'SCHOOL_CHANGED', schoolId });
        return true;
      } catch (error) {
        Sentry.captureException(new Error('Failed to broadcast school change:'), {
          extra: { error },
        });
      }
    }

    if (storageType.current === 'localStorage') {
      try {
        const currentStorage = localStorage.getItem(STORAGE_KEY);
        const storageData = currentStorage ? JSON.parse(currentStorage) : {};
        storageData.state = { ...storageData.state, selectedSchool: schoolId };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
        return true;
      } catch (error) {
        Sentry.captureException(new Error('Failed to update localStorage:'), {
          extra: { error },
        });
      }
    }

    return false;
  };

  return { broadcastSchoolChange, storageType: storageType.current };
};
