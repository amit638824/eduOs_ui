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

    const block = (e: Event) => {
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
    document.addEventListener('copy', block);
    document.addEventListener('paste', block);
    document.addEventListener('cut', block);
    document.addEventListener('contextmenu', block);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenExit);
      document.removeEventListener('copy', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('contextmenu', block);
    };
  }, [enabled, config, logEvent, onMaxViolations]);

  return { enterFullscreen, logEvent, tabCountRef };
}
