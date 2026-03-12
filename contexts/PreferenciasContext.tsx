// contexts/PreferenciasContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageService } from '../utils/storage';

interface PreferenciasContextData {
  efeitosSonoros: boolean;
  avisosVisuais: boolean;
  toggleEfeitosSonoros: () => void;
  toggleAvisosVisuais: () => void;
  setEfeitosSonoros: (valor: boolean) => void;
  setAvisosVisuais: (valor: boolean) => void;
}

const PreferenciasContext = createContext<PreferenciasContextData>({} as PreferenciasContextData);

export const usePreferencias = () => {
  const context = useContext(PreferenciasContext);
  if (!context) {
    throw new Error('usePreferencias deve ser usado dentro de um PreferenciasProvider');
  }
  return context;
};

export const PreferenciasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [efeitosSonoros, setEfeitosSonoros] = useState(true);
  const [avisosVisuais, setAvisosVisuais] = useState(true);

  useEffect(() => {
    carregarPreferencias();
  }, []);

  const carregarPreferencias = async () => {
    try {
      const som = await StorageService.getItem('@pref_efeitos_sonoros');
      if (som !== null) setEfeitosSonoros(som === 'true');
      
      const avisos = await StorageService.getItem('@pref_avisos_visuais');
      if (avisos !== null) setAvisosVisuais(avisos === 'true');
    } catch (error) {
      console.log('Erro ao carregar preferências:', error);
    }
  };

  const handleSetEfeitosSonoros = async (valor: boolean) => {
    setEfeitosSonoros(valor);
    await StorageService.setItem('@pref_efeitos_sonoros', valor.toString());
  };

  const handleSetAvisosVisuais = async (valor: boolean) => {
    setAvisosVisuais(valor);
    await StorageService.setItem('@pref_avisos_visuais', valor.toString());
  };

  return (
    <PreferenciasContext.Provider
      value={{
        efeitosSonoros,
        avisosVisuais,
        toggleEfeitosSonoros: () => handleSetEfeitosSonoros(!efeitosSonoros),
        toggleAvisosVisuais: () => handleSetAvisosVisuais(!avisosVisuais),
        setEfeitosSonoros: handleSetEfeitosSonoros,
        setAvisosVisuais: handleSetAvisosVisuais,
      }}
    >
      {children}
    </PreferenciasContext.Provider>
  );
};