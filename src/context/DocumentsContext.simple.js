import React, { createContext, useContext, useState } from 'react';

const DocumentsContext = createContext();

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);

  const value = {
    documents,
    // Funciones dummy para compatibilidad
    addDocument: async () => ({ success: true }),
    deleteDocument: async () => ({ success: true }),
    updateDocument: async () => ({ success: true }),
    getDocumentsByCategory: () => [],
    searchDocuments: () => [],
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
