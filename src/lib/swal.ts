import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

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

function toastMessage(title: string, text?: string) {
  return text ? `${title} — ${text}` : title;
}

/** Success feedback — react-toastify (not a blocking modal) */
export function showSuccess(title: string, text?: string): void {
  toast.success(toastMessage(title, text));
}

/** Error feedback — react-toastify */
export function showError(title: string, text?: string): void {
  toast.error(toastMessage(title, text));
}

/** Info feedback — react-toastify */
export function showInfo(title: string, text?: string): void {
  toast.info(toastMessage(title, text));
}

export { Swal, toast };
