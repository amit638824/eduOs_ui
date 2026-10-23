import { useCallback, useEffect, useRef } from 'react';
import { examinationService } from '@/services';
import type { ExamSecurityConfig } from '@/types/examination';

interface UseExamProctoringOptions {
  attemptId: string;
  enabled: boolean;
  config: ExamSecurityConfig;
  onTabSwitch?: (count: number) => void;
  onMaxViolations?: () => void;
  onMaxCopyPasteAttempts?: () => void;
  onMaxFullscreenExits?: () => void;
  onWarning?: (message: string) => void;

}

export function useExamProctoring({
  attemptId,
  enabled,
  config,
  onTabSwitch,
  onMaxViolations,
  onMaxCopyPasteAttempts,
  onMaxFullscreenExits,
  onWarning,
}: UseExamProctoringOptions) {
  const tabCountRef = useRef(0);
  const copyPasteCountRef = useRef(0);
  const fullscreenExitCountRef = useRef(0);
  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    if (!config.fullScreen) return true;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      return true;
    } catch {
      return false;
    }
  }, [config.fullScreen]);

  const logEvent = useCallback(
    async (event: string, detail?: Record<string, unknown>) => {
      if (!enabled || !attemptId) return;
      try {
        const res = await examinationService.logProctoringEvent(attemptId, event, detail);
        if (event === 'tab_switch') {
          tabCountRef.current = res.tab_switch_count;
          onTabSwitch?.(res.tab_switch_count);
        }
      } catch {
        /* ignore logging failures */
      }
    },
    [attemptId, enabled, onTabSwitch],
  );

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.hidden && config.browserLock) {
        tabCountRef.current += 1;
        void logEvent('tab_switch', { count: tabCountRef.current });
        if (tabCountRef.current >= config.maxTabSwitches) {
          onMaxViolations?.();
        }
      }
    };

    const recordCopyPasteAttempt = (
      event: 'copy_attempt' | 'paste_attempt' | 'cut_attempt'
    ) => {
      copyPasteCountRef.current += 1;

      void logEvent(event);

      onWarning?.(
        `Copy-paste detected (${copyPasteCountRef.current}/${config.maxCopyPasteAttempts})`
      );
      if (copyPasteCountRef.current > config.maxCopyPasteAttempts) {
        onMaxCopyPasteAttempts?.();
      }
    };

    const onCopy = () => {
      recordCopyPasteAttempt('copy_attempt');
    };

    const onPaste = () => {
      recordCopyPasteAttempt('paste_attempt');
    };

    const onCut = () => {
      recordCopyPasteAttempt('cut_attempt');
    };



    const onBlur = () => {
      if (config.browserLock) void logEvent('window_blur');
    };

    const onFullscreenExit = () => {
      if (config.fullScreen && !document.fullscreenElement) {
        fullscreenExitCountRef.current += 1;
        void logEvent('fullscreen_exit');

        onWarning?.(
          `Warning: Full-screen exited (${fullscreenExitCountRef.current}/${config.maxFullscreenExits})`
        );

        if (fullscreenExitCountRef.current > config.maxFullscreenExits) {
          onMaxFullscreenExits?.();
        }
      }
    };


    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenExit);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut', onCut);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenExit);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut', onCut);
    };
  }, [
    enabled,
    config,
    logEvent,
    onMaxViolations,
    onWarning,
    onMaxCopyPasteAttempts,
    onMaxFullscreenExits,
  ]);

  return { enterFullscreen, logEvent, tabCountRef };
}

