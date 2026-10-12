import { useCallback, useEffect, useRef } from 'react';
import { examinationService } from '@/services';
import type { ExamSecurityConfig } from '@/types/examination';

interface UseExamProctoringOptions {
  attemptId: string;
  enabled: boolean;
  config: ExamSecurityConfig;
  onTabSwitch?: (count: number) => void;
  onMaxViolations?: () => void;
}

export function useExamProctoring({
  attemptId,
  enabled,
  config,
  onTabSwitch,
  onMaxViolations,
}: UseExamProctoringOptions) {
  const tabCountRef = useRef(0);

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

    const onCopy = (e: Event) => {
      if (config.blockCopyPaste) {
        e.preventDefault();
        void logEvent('copy_attempt');
      }
    };
    const onPaste = (e: Event) => {
      if (config.blockCopyPaste) {
        e.preventDefault();
        void logEvent('paste_attempt');
      }
    };
    const onCut = (e: Event) => {
      if (config.blockCopyPaste) {
        e.preventDefault();
        void logEvent('cut_attempt');
      }
    };
    const onContext = (e: Event) => {
      if (config.blockCopyPaste) e.preventDefault();
    };

    const onBlur = () => {
      if (config.browserLock) void logEvent('window_blur');
    };

    const onFullscreenExit = () => {
      if (config.fullScreen && !document.fullscreenElement) {
        void logEvent('fullscreen_exit');
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenExit);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut', onCut);
    document.addEventListener('contextmenu', onContext);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenExit);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('contextmenu', onContext);
    };
  }, [enabled, config, logEvent, onMaxViolations]);

  return { enterFullscreen, logEvent, tabCountRef };
}
