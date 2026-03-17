// hooks/useContagem.ts
import { useEffect, useMemo, useState } from 'react';

export const useContagem = (itemExistente?: any) => {
  const [qtdPaletes, setQtdPaletes] = useState('');
  const [cxPorPalete, setCxPorPalete] = useState('');
  const [cxAvulsas, setCxAvulsas] = useState('');
  const [unidPorCx, setUnidPorCx] = useState('1');
  const [unidAvulsas, setUnidAvulsas] = useState('');
  const [avulsosExp, setAvulsosExp] = useState('');
  const [saldoSpalm, setSaldoSpalm] = useState('');

  // Efeito para carregar dados quando itemExistente mudar
  useEffect(() => {
    if (itemExistente) {
      setQtdPaletes(itemExistente.qtdPaletes?.toString() || '');
      setCxPorPalete(itemExistente.cxPorPalete?.toString() || '');
      setCxAvulsas(itemExistente.cxAvulsas?.toString() || '');
      setUnidPorCx(itemExistente.unidPorCx?.toString() || '1');
      setUnidAvulsas(itemExistente.unidAvulsas?.toString() || '');
      setAvulsosExp(itemExistente.avulsosExp?.toString() || '');
      setSaldoSpalm(itemExistente.saldoSpalm?.toString() || '');
    } else {
      // Reset quando não tem item
      setQtdPaletes('');
      setCxPorPalete('');
      setCxAvulsas('');
      setUnidPorCx('1');
      setUnidAvulsas('');
      setAvulsosExp('');
      setSaldoSpalm('');
    }
  }, [itemExistente]);

  // Cálculo do total geral
  const totalGeral = useMemo(() => {
    const paletes = Number(qtdPaletes) || 0;
    const cxPal = Number(cxPorPalete) || 0;
    const cxAvul = Number(cxAvulsas) || 0;
    const unidCx = Number(unidPorCx) || 1;
    const unidAvul = Number(unidAvulsas) || 0;
    const avulExp = Number(avulsosExp) || 0;

    const totalCaixas = (paletes * cxPal) + cxAvul;
    const totalUnidades = (totalCaixas * unidCx) + unidAvul + avulExp;
    
    return totalUnidades.toString();
  }, [qtdPaletes, cxPorPalete, cxAvulsas, unidPorCx, unidAvulsas, avulsosExp]);

  // Cálculo da diferença
  const diferenca = useMemo(() => {
    const total = Number(totalGeral) || 0;
    const saldo = Number(saldoSpalm) || 0;
    return (total - saldo).toString();
  }, [totalGeral, saldoSpalm]);

  return {
    qtdPaletes,
    setQtdPaletes,
    cxPorPalete,
    setCxPorPalete,
    cxAvulsas,
    setCxAvulsas,
    unidPorCx,
    setUnidPorCx,
    unidAvulsas,
    setUnidAvulsas,
    avulsosExp,
    setAvulsosExp,
    saldoSpalm,
    setSaldoSpalm,
    totalGeral,
    diferenca,
    
    // Função para reset
    reset: () => {
      setQtdPaletes('');
      setCxPorPalete('');
      setCxAvulsas('');
      setUnidPorCx('1');
      setUnidAvulsas('');
      setAvulsosExp('');
      setSaldoSpalm('');
    },
    
    // Função para carregar dados
    loadFromItem: (item: any) => {
      setQtdPaletes(item.qtdPaletes?.toString() || '');
      setCxPorPalete(item.cxPorPalete?.toString() || '');
      setCxAvulsas(item.cxAvulsas?.toString() || '');
      setUnidPorCx(item.unidPorCx?.toString() || '1');
      setUnidAvulsas(item.unidAvulsas?.toString() || '');
      setAvulsosExp(item.avulsosExp?.toString() || '');
      setSaldoSpalm(item.saldoSpalm?.toString() || '');
    },
    
    // Função para obter dados
    getDados: () => ({
      qtdPaletes: Number(qtdPaletes) || 0,
      cxPorPalete: Number(cxPorPalete) || 0,
      cxAvulsas: Number(cxAvulsas) || 0,
      unidPorCx: Number(unidPorCx) || 1,
      unidAvulsas: Number(unidAvulsas) || 0,
      avulsosExp: Number(avulsosExp) || 0,
      saldoSpalm: Number(saldoSpalm) || 0,
      totalGeral: Number(totalGeral) || 0,
      diferenca: Number(diferenca) || 0
    })
  };
};