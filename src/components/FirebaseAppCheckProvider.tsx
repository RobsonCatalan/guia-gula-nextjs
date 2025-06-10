'use client';

import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { initializeFirebaseAppCheck } from '../lib/firebase';

// 1. Criar o Contexto
interface AppCheckContextType {
  isAppCheckReady: boolean;
}

const AppCheckContext = createContext<AppCheckContextType>({ isAppCheckReady: false });

// Hook customizado para usar o contexto
export const useAppCheckContext = () => useContext(AppCheckContext);

interface FirebaseAppCheckProviderProps {
  children: ReactNode;
}

export default function FirebaseAppCheckProvider({ children }: FirebaseAppCheckProviderProps) {
  // 2. Adicionar estado
  const [isAppCheckReady, setIsAppCheckReady] = useState(false);

  useEffect(() => {
    console.log('[FirebaseAppCheckProvider] Initializing App Check if configured...');
    try {
      initializeFirebaseAppCheck();
    } catch (error) {
      console.error('[FirebaseAppCheckProvider] Error during App Check initialization:', error);
    } finally {
      // Signal ready regardless, so dependent components fetch data
      setIsAppCheckReady(true);
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez

  // 4. Prover o contexto com o estado
  return (
    <AppCheckContext.Provider value={{ isAppCheckReady }}>
      {children}
    </AppCheckContext.Provider>
  );
}
