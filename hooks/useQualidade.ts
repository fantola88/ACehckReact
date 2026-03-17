// hooks/useQualidade.ts
import { useEffect, useState } from 'react';

export const useQualidade = (itemExistente?: any) => {
  const [embStatus, setEmbStatus] = useState('OK');
  const [obsEmb, setObsEmb] = useState('');
  const [showObsEmb, setShowObsEmb] = useState(false);
  const [valStatus, setValStatus] = useState('OK');
  const [obsVal, setObsVal] = useState('');
  const [showObsVal, setShowObsVal] = useState(false);

  // Efeito para carregar dados quando itemExistente mudar
  useEffect(() => {
    if (itemExistente) {
      setEmbStatus(itemExistente.embStatus || 'OK');
      setObsEmb(itemExistente.obsEmb || '');
      setShowObsEmb(itemExistente.embStatus === 'AVARIA');
      setValStatus(itemExistente.valStatus || 'OK');
      setObsVal(itemExistente.obsVal || '');
      setShowObsVal(itemExistente.valStatus === 'VENCIDO');
    } else {
      reset();
    }
  }, [itemExistente]);

  const reset = () => {
    setEmbStatus('OK');
    setObsEmb('');
    setShowObsEmb(false);
    setValStatus('OK');
    setObsVal('');
    setShowObsVal(false);
  };

  const loadFromItem = (item: any) => {
    setEmbStatus(item?.embStatus || 'OK');
    setObsEmb(item?.obsEmb || '');
    setShowObsEmb(item?.embStatus === 'AVARIA');
    setValStatus(item?.valStatus || 'OK');
    setObsVal(item?.obsVal || '');
    setShowObsVal(item?.valStatus === 'VENCIDO');
  };

  const getDados = () => ({
    embStatus,
    obsEmb,
    valStatus,
    obsVal
  });

  return {
    embStatus,
    setEmbStatus,
    obsEmb,
    setObsEmb,
    showObsEmb,
    setShowObsEmb,
    valStatus,
    setValStatus,
    obsVal,
    setObsVal,
    showObsVal,
    setShowObsVal,
    reset,
    loadFromItem,
    getDados
  };
};