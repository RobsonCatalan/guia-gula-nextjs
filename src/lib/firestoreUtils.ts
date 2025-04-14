// src/lib/firestoreUtils.ts
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  DocumentData,
  WriteBatch,
  writeBatch,
  getFirestore
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Adiciona um documento a uma coleção no Firestore
 * @param collectionName Nome da coleção
 * @param data Dados a serem adicionados
 * @returns ID do documento criado
 */
export const addDocument = async (collectionName: string, data: any): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Erro ao adicionar documento na coleção ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Atualiza um documento existente no Firestore
 * @param collectionName Nome da coleção
 * @param documentId ID do documento
 * @param data Dados a serem atualizados
 */
export const updateDocument = async (collectionName: string, documentId: string, data: any): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Erro ao atualizar documento ${documentId} na coleção ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Remove um documento do Firestore
 * @param collectionName Nome da coleção
 * @param documentId ID do documento
 */
export const deleteDocument = async (collectionName: string, documentId: string): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Erro ao excluir documento ${documentId} da coleção ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Cria uma operação em lote para executar múltiplas operações em uma única transação
 * @returns Objeto WriteBatch
 */
export const createBatch = (): WriteBatch => {
  return writeBatch(db);
};

/**
 * Executa uma operação em lote
 * @param batch Objeto WriteBatch
 */
export const commitBatch = async (batch: WriteBatch): Promise<void> => {
  try {
    await batch.commit();
  } catch (error) {
    console.error('Erro ao executar operação em lote:', error);
    throw error;
  }
};

/**
 * Converte um objeto do Firestore em um formato mais amigável
 * @param doc Documento do Firestore
 * @returns Objeto com dados formatados
 */
export const formatFirestoreDoc = <T>(doc: T): Record<string, any> => {
  if (!doc || typeof doc !== 'object') {
    return {} as Record<string, any>;
  }
  
  const data = { ...doc as unknown as Record<string, any> };
  
  // Converte objetos Timestamp para Date
  Object.keys(data).forEach((key) => {
    if (data[key] && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate();
    }
  });
  
  return data;
};
