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
    console.log('[FirebaseAppCheckProvider] useEffect triggered, initializing App Check...');
    try {
      const appCheckInstance = initializeFirebaseAppCheck();
      if (appCheckInstance) {
        // 3. Atualizar estado SÓ se a inicialização foi bem-sucedida
        console.log('[FirebaseAppCheckProvider] App Check initialization seems successful, setting ready state.');
        setIsAppCheckReady(true);
      } else {
        console.error('[FirebaseAppCheckProvider] App Check initialization failed or skipped, not setting ready state.');
      }
    } catch (error) {
      console.error('[FirebaseAppCheckProvider] Error during App Check initialization in provider:', error);
      setIsAppCheckReady(false); // Garantir que fique falso em caso de erro
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez

  // 4. Prover o contexto com o estado
  return (
    <AppCheckContext.Provider value={{ isAppCheckReady }}>
      {children}
    </AppCheckContext.Provider>
  );
}
