import React, { createContext, ReactNode, useContext, useState } from 'react';

interface AppContextType {
  photos: string[];
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <AppContext.Provider value={{ photos, setPhotos, loading, setLoading }}>
      {children}
    </AppContext.Provider>
  );
};


export const usePhotos = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('usePhotos must be used within a PhotosProvider');
  }
  return context;
};
