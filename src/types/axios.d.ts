export {};

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Skip the global success/error toast for this call. */
    skipToast?: boolean;
  }
}
