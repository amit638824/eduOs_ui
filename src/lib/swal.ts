import Swal from 'sweetalert2';
import { notify } from '@/lib/toast';

const base = Swal.mixin({
  buttonsStyling: true,
  reverseButtons: true,
  heightAuto: false,
});

/** Delete / destructive confirm — SweetAlert2 */
export async function confirmDelete(options?: {
  title?: string;
  text?: string;
  confirmText?: string;
}): Promise<boolean> {
  const result = await base.fire({
    title: options?.title ?? 'Are you sure?',
    text: options?.text ?? "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: options?.confirmText ?? 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
}

/** Generic confirm (submit, activate, suspend, etc.) — SweetAlert2 */
export async function confirmAction(options: {
  title?: string;
  text: string;
  icon?: 'warning' | 'question' | 'info';
  confirmText?: string;
  confirmColor?: string;
}): Promise<boolean> {
  // Fullscreen exams: dialog must render inside the fullscreen element or it is invisible
  const fullscreenRoot = document.fullscreenElement as HTMLElement | null;
  const result = await base.fire({
    title: options.title ?? 'Are you sure?',
    text: options.text,
    icon: options.icon ?? 'question',
    showCancelButton: true,
    confirmButtonColor: options.confirmColor ?? '#3085d6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: options.confirmText ?? 'Yes, confirm',
    cancelButtonText: 'Cancel',
    target: fullscreenRoot ?? 'body',
    heightAuto: false,
  });
  return result.isConfirmed;
}

/** Success feedback. Same global toast as API responses. */
export function showSuccess(title: string, text?: string): void {
  notify.success(text || title, text ? { title } : undefined);
}

/** Error feedback. Same global toast as API responses. */
export function showError(title: string, text?: string): void {
  notify.error(text || title, text ? { title } : undefined);
}

/** Info feedback. Same global toast as API responses. */
export function showInfo(title: string, text?: string): void {
  notify.info(text || title, text ? { title } : undefined);
}

export { Swal, notify };
