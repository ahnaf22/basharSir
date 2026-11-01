'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { studyPlannerApi } from '../api/study-planner.api';

export interface UseActiveStudyHeartbeatOptions {
  sourceType: 'tutor_session' | 'exam_attempt' | 'resource_study';
  sourceId: number;
  subjectId?: number;
  enabled?: boolean;
  pingIntervalMs?: number;
  idleCutoffMs?: number;
}

export interface UseActiveStudyHeartbeatResult {
  activeSeconds: number;
  pausedSeconds: number;
  isIdle: boolean;
  triggerManualPing: (forceIdle?: boolean) => Promise<void>;
}

export function useActiveStudyHeartbeat({
  sourceType,
  sourceId,
  subjectId,
  enabled = true,
  pingIntervalMs = 30_000,
  idleCutoffMs = 120_000,
}: UseActiveStudyHeartbeatOptions): UseActiveStudyHeartbeatResult {
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [pausedSeconds, setPausedSeconds] = useState<number>(0);
  const [isIdle, setIsIdle] = useState<boolean>(false);

  const lastActivityTimestampRef = useRef<number>(Date.now());

  const recordUserActivity = useCallback((): void => {
    lastActivityTimestampRef.current = Date.now();
    setIsIdle(false);
  }, []);

  const triggerManualPing = useCallback(
    async (forceIdle?: boolean): Promise<void> => {
      const now = Date.now();
      const idleDurationMs = now - lastActivityTimestampRef.current;
      const tabHidden =
        typeof document !== 'undefined' && document.visibilityState === 'hidden';
      const detectedIdle =
        forceIdle ?? (tabHidden || idleDurationMs >= idleCutoffMs);

      setIsIdle(detectedIdle);
      const elapsedSeconds = Math.round(pingIntervalMs / 1000);

      try {
        const res = await studyPlannerApi.sendHeartbeat({
          source_type: sourceType,
          source_id: sourceId,
          subject_id: subjectId,
          is_idle: detectedIdle,
          elapsed_seconds: elapsedSeconds,
        });
        setActiveSeconds(res.active_seconds);
        setPausedSeconds(res.paused_seconds);
      } catch {
        // Local fallback accounting when offline
        if (detectedIdle) {
          setPausedSeconds((prev) => prev + elapsedSeconds);
        } else {
          setActiveSeconds((prev) => prev + elapsedSeconds);
        }
      }
    },
    [idleCutoffMs, pingIntervalMs, sourceId, sourceType, subjectId]
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const activityEvents: ReadonlyArray<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
    ];

    activityEvents.forEach((evt) =>
      window.addEventListener(evt, recordUserActivity, { passive: true })
    );

    const intervalId = window.setInterval(() => {
      void triggerManualPing();
    }, pingIntervalMs);

    return () => {
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, recordUserActivity)
      );
      window.clearInterval(intervalId);
    };
  }, [enabled, pingIntervalMs, recordUserActivity, triggerManualPing]);

  return {
    activeSeconds,
    pausedSeconds,
    isIdle,
    triggerManualPing,
  };
}

