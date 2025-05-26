// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { 
  initializeAppCheck, 
  ReCaptchaV3Provider, 
  AppCheck
} from 'firebase/app-check';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializa o Firebase apenas uma vez
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Ativa o console de debug para App Check em ambiente de desenvolvimento
// Verificando se está no ambiente de cliente antes de usar 'self'
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[firebase.ts] Setting App Check Debug Token...');
  // @ts-ignore
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
}

// Variável para guardar a instância do AppCheck
let appCheckInstance: AppCheck | null = null;

// Função para inicializar o App Check (será chamada pelo Provider)
export function initializeFirebaseAppCheck(): AppCheck | null {
  if (typeof window === 'undefined') {
    console.log('[firebase.ts] Skipping App Check initialization on the server.');
    return null; // App Check só roda no cliente
  }

  // Evitar reinicialização
  if (appCheckInstance) {
    console.log('[firebase.ts] App Check already initialized.');
    return appCheckInstance;
  }

  console.log('[firebase.ts] Running App Check initialization function.');
  
  // Usar a variável de ambiente para a chave do site reCAPTCHA
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  if (!siteKey) {
    console.error('[firebase.ts] ERROR: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not defined!');
    return null;
  }
  
  console.log(`[firebase.ts] Initializing App Check with Site Key from env: ${siteKey.substring(0, 5)}...`);
  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
    
    console.log('[firebase.ts] App Check initialized successfully via function.');
    return appCheckInstance;
  } catch (error) {
    console.error('[firebase.ts] Error initializing App Check via function:', error);
    return null;
  }
}

// Obtém a instância do Firestore
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

// Exportar db, app e a função de inicialização
export { db, app };
