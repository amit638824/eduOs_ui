import Swal from 'sweetalert2';

const base = Swal.mixin({
  buttonsStyling: true,
  reverseButtons: true,
  heightAuto: false,
});

/** Delete / destructive confirm — returns true if user confirmed */
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

/** Generic confirm (submit, approve, etc.) */
export async function confirmAction(options: {
  title?: string;
  text: string;
  icon?: 'warning' | 'question' | 'info';
  confirmText?: string;
  confirmColor?: string;
}): Promise<boolean> {
  const result = await base.fire({
    title: options.title ?? 'Are you sure?',
    text: options.text,
    icon: options.icon ?? 'question',
    showCancelButton: true,
    confirmButtonColor: options.confirmColor ?? '#3085d6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: options.confirmText ?? 'Yes, confirm',
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
}

export async function showSuccess(title: string, text?: string): Promise<void> {
  await base.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#3085d6',
  });
}

export async function showError(title: string, text?: string): Promise<void> {
  await base.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#d33',
  });
}

export { Swal };
