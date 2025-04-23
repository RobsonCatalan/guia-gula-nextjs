// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  initializeAppCheck, 
  ReCaptchaV3Provider, 
  AppCheck
} from 'firebase/app-check';

// Configuração do Firebase HARDCODED para teste - NÃO USE EM PRODUÇÃO!
// IMPORTANTE: Isso é temporário apenas para diagnóstico!
const firebaseConfig = {
  apiKey: "AIzaSyAr6gwQ5LfjPfcGCvsbotVcKpxHjgeKBKc", // HARDCODED TEMPORÁRIO
  authDomain: "gulaapp-5be3b.firebaseapp.com",
  projectId: "gulaapp-5be3b",
  storageBucket: "gulaapp-5be3b.appspot.com",
  messagingSenderId: "558045735007",
  appId: "1:558045735007:web:2fa575ffb7d1c3d14b93ea",
  measurementId: "G-DM7G2RGD32",
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
  
  // HARDCODED PARA TESTE - NÃO USE EM PRODUÇÃO!
  // CHAVE RECAPTCHA V3 FIXA PARA DIAGNÓSTICO!
  const siteKey = "6LdjJCArAAAAAOwjhXXvF4wKzlsaFz_gegwvtOBl"; // FIXO!
  
  console.log(`[firebase.ts] Initializing App Check with HARDCODED Site Key: ${siteKey.substring(0, 5)}...`);
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
const db = getFirestore(app);

// Exportar db, app e a função de inicialização
export { db, app };
