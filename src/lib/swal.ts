import Swal from 'sweetalert2';
import { notify } from '@/lib/toast';

const base = Swal.mixin({
  buttonsStyling: true,
  reverseButtons: true,
  heightAuto: false,
  customClass: {
    popup: 'ms-swal-popup',
    title: 'ms-swal-title',
    htmlContainer: 'ms-swal-html',
    actions: 'ms-swal-actions',
    confirmButton: 'ms-swal-confirm',
    cancelButton: 'ms-swal-cancel',
  },
});

/** Delete / destructive confirm — SweetAlert2 */
export async function confirmDelete(options?: {
  title?: string;
  text?: string;
  confirmText?: string;
  confirmColor?: string;
  cancelColor?: string;
}): Promise<boolean> {
  const result = await base.fire({
    title: options?.title ?? 'Delete Organization?',
    text: options?.text ?? "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: options?.confirmColor ?? '#10b981',
    cancelButtonColor: options?.cancelColor ?? '#ffffff',
    confirmButtonText: options?.confirmText ?? 'Yes, Delete It!',
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
  cancelColor?: string;
}): Promise<boolean> {
  // Fullscreen exams: dialog must render inside the fullscreen element or it is invisible
  const fullscreenRoot = document.fullscreenElement as HTMLElement | null;
  const result = await base.fire({
    title: options.title ?? 'Are you sure?',
    text: options.text,
    icon: options.icon ?? 'question',
    showCancelButton: true,
    confirmButtonColor: options.confirmColor ?? '#10b981',
    cancelButtonColor: options.cancelColor ?? '#ffffff',
    confirmButtonText: options.confirmText ?? 'Yes, Confirm',
    cancelButtonText: 'Cancel',
    target: fullscreenRoot ?? 'body',
    heightAuto: false,
  });
  return result.isConfirmed;
}

/** Shows the API message. A title is used only when no API message was passed. */
export function showSuccess(
  title: string,
  text?: string,
  options?: { position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left' },
): void {
  notify.success(text || title, options);
}

/** Shows the API message. A title is used only when no API message was passed. */
export function showError(title: string, text?: string): void {
  notify.error(text || title);
}

/** Shows the API message. A title is used only when no API message was passed. */
export function showInfo(title: string, text?: string): void {
  notify.info(text || title);
}

export { Swal, notify };
