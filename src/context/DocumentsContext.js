import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useAuth } from './AuthContext';

const DocumentsContext = createContext();

const initialState = {
  documents: [],
  isLoading: false,
};

function documentsReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload]
      };
    
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc => 
          doc.id === action.payload.id ? action.payload : doc
        )
      };
    
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload)
      };
    
    default:
      return state;
  }
}

export function DocumentsProvider({ children }) {
  const [state, dispatch] = useReducer(documentsReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  useEffect(() => {
    if (user && state.documents.length > 0) {
      saveDocuments();
    }
  }, [state.documents, user]);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      const key = `documents_${user.id}`;
      const documentsData = await AsyncStorage.getItem(key);
      
      if (documentsData) {
        const parsed = JSON.parse(documentsData);
        dispatch({ type: 'SET_DOCUMENTS', payload: parsed });
      }
    } catch (error) {
      console.error('Error cargando documentos:', error);
    }
  };

  const saveDocuments = async () => {
    if (!user) return;

    try {
      const key = `documents_${user.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(state.documents));
    } catch (error) {
      console.error('Error guardando documentos:', error);
    }
  };

  const pickDocument = async (type = 'general') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Solicitar permisos si es necesario
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        return { 
          success: false, 
          error: 'Permisos de almacenamiento requeridos' 
        };
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const savedDocument = await saveDocumentToApp(asset, type);
        
        if (savedDocument.success) {
          dispatch({ type: 'ADD_DOCUMENT', payload: savedDocument.document });
          return { success: true, document: savedDocument.document };
        } else {
          return savedDocument;
        }
      }

      return { success: false, error: 'Selección cancelada' };
    } catch (error) {
      console.error('Error seleccionando documento:', error);
      return { success: false, error: 'Error seleccionando documento' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveDocumentToApp = async (asset, type) => {
    try {
      const documentsDir = `${FileSystem.documentDirectory}FinanzaLite/documents/`;
      
      // Crear directorio si no existe
      await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });

      const fileName = `${Date.now()}_${asset.name}`;
      const newPath = `${documentsDir}${fileName}`;

      // Copiar archivo al directorio de la app
      await FileSystem.copyAsync({
        from: asset.uri,
        to: newPath,
      });

      // Obtener información del archivo
      const fileInfo = await FileSystem.getInfoAsync(newPath);

      const document = {
        id: Date.now().toString(),
        name: asset.name,
        fileName: fileName,
        type: type,
        category: getDocumentCategory(asset.name),
        uri: newPath,
        size: fileInfo.size,
        mimeType: asset.mimeType || 'application/pdf',
        uploadedAt: new Date().toISOString(),
        tags: [],
        description: '',
        transactionIds: [], // IDs de transacciones relacionadas
        month: null, // Mes asociado si es una cartola
        year: null, // Año asociado
      };

      return { success: true, document };
    } catch (error) {
      console.error('Error guardando documento:', error);
      return { success: false, error: 'Error guardando documento' };
    }
  };

  const getDocumentCategory = (fileName) => {
    const name = fileName.toLowerCase();
    
    if (name.includes('cartola') || name.includes('estado') || name.includes('tarjeta')) {
      return 'cartola';
    } else if (name.includes('recibo') || name.includes('boleta') || name.includes('factura')) {
      return 'recibo';
    } else if (name.includes('contrato') || name.includes('arriendo')) {
      return 'contrato';
    } else if (name.includes('nomina') || name.includes('sueldo')) {
      return 'nomina';
    }
    
    return 'general';
  };

  const updateDocument = (document) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: document });
  };

  const deleteDocument = async (documentId) => {
    try {
      const document = state.documents.find(doc => doc.id === documentId);
      if (document) {
        // Eliminar archivo físico
        await FileSystem.deleteAsync(document.uri, { idempotent: true });
        
        // Eliminar de la lista
        dispatch({ type: 'DELETE_DOCUMENT', payload: documentId });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error eliminando documento:', error);
      return { success: false, error: 'Error eliminando documento' };
    }
  };

  const getDocumentsByCategory = (category) => {
    return state.documents.filter(doc => doc.category === category);
  };

  const getDocumentsByMonth = (month, year) => {
    return state.documents.filter(doc => 
      doc.month === month && doc.year === year
    );
  };

  const associateDocumentToTransaction = (documentId, transactionId) => {
    const document = state.documents.find(doc => doc.id === documentId);
    if (document) {
      const updatedDocument = {
        ...document,
        transactionIds: [...document.transactionIds, transactionId]
      };
      updateDocument(updatedDocument);
    }
  };

  const getDocumentsForTransaction = (transactionId) => {
    return state.documents.filter(doc => 
      doc.transactionIds.includes(transactionId)
    );
  };

  const addTagToDocument = (documentId, tag) => {
    const document = state.documents.find(doc => doc.id === documentId);
    if (document && !document.tags.includes(tag)) {
      const updatedDocument = {
        ...document,
        tags: [...document.tags, tag]
      };
      updateDocument(updatedDocument);
    }
  };

  const removeTagFromDocument = (documentId, tag) => {
    const document = state.documents.find(doc => doc.id === documentId);
    if (document) {
      const updatedDocument = {
        ...document,
        tags: document.tags.filter(t => t !== tag)
      };
      updateDocument(updatedDocument);
    }
  };

  const searchDocuments = (query) => {
    if (!query.trim()) return state.documents;
    
    const searchTerm = query.toLowerCase();
    return state.documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm) ||
      doc.description.toLowerCase().includes(searchTerm) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      doc.category.toLowerCase().includes(searchTerm)
    );
  };

  const value = {
    ...state,
    pickDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByCategory,
    getDocumentsByMonth,
    associateDocumentToTransaction,
    getDocumentsForTransaction,
    addTagToDocument,
    removeTagFromDocument,
    searchDocuments,
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}

export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments debe usarse dentro de DocumentsProvider');
  }
  return context;
};
