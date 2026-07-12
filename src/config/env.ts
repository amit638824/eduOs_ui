type ApiEnvironment = 'prod' | 'test';

function readApiEnvironment(): ApiEnvironment {
  const value = import.meta.env.VITE_API_ADDRESS?.toLowerCase();
  return value === 'prod' ? 'prod' : 'test';
}

const isProd = readApiEnvironment() === 'prod';

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'EduTest Pro',
  apiEnvironment: readApiEnvironment(),
  isProd,

  apiBaseUrl: isProd
    ? import.meta.env.VITE_PROD_URL
    : import.meta.env.VITE_LOCAL_URL,

  imageBaseUrl: isProd
    ? import.meta.env.VITE_PROD_IMAGE_URL
    : import.meta.env.VITE_LOCAL_IMAGE_URL,

  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    fcmPublicKey: import.meta.env.VITE_FIREBASE_FCM_PUBLIC_KEY,
  },
} as const;
