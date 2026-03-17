import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';
import { calcularContagem, formatarDiferenca, getCorSituacao } from '../utils/calculos';

interface ItemCardProps {
  produto: any;
  itemContado: any;
  contado: boolean;
  onEditar: (item: any) => void;
  onRemover: (produto: any, itemContado: any) => void;
  onContar: (produto: any) => void;
}

const ItemCardComponent = ({ 
  produto, 
  itemContado, 
  contado, 
  onEditar, 
  onRemover,
  onContar 
}: ItemCardProps) => {
  
  const handlePressCard = useCallback(() => {
    onContar(produto);
  }, [produto, onContar]);

  const handleEditar = useCallback(() => {
    onEditar(itemContado);
  }, [itemContado, onEditar]);

  const handleRemover = useCallback(() => {
    onRemover(produto, itemContado);
  }, [produto, itemContado, onRemover]);

  // Cálculo correto usando a função do arquivo calculos.ts
  const resultado = useMemo(() => {
    if (!contado || !itemContado) return null;
    
    return calcularContagem({
      qtdPaletes: Number(itemContado.fisico?.paletes) || 0,
      cxPorPalete: Number(itemContado.fisico?.cxPorPalete) || 1,
      cxAvulsas: Number(itemContado.fisico?.caixas) || 0,
      unidPorCx: Number(itemContado.fisico?.unidPorCx) || 1,
      unidAvulsas: Number(itemContado.fisico?.unidades) || 0,
      avulsosExp: Number(itemContado.fisico?.expedicao) || 0,
      saldoSpalm: Number(itemContado.spalm) || 0
    });
  }, [contado, itemContado]);

  if (!contado || !resultado) {
    // Render para itens não contados
    return (
      <TouchableOpacity 
        style={styles.itemCard}
        onPress={handlePressCard}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemCodigo}>{produto.cod}</Text>
          </View>

          <View style={styles.itemActions}>
            <TouchableOpacity
              onPress={handleRemover}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.itemNome}>{produto.nome}</Text>
        <Text style={styles.itemUnidade}>Unidade: {produto.unid}</Text>
        
        <View style={styles.naoContadoBadge}>
          <Ionicons name="time-outline" size={14} color={colors.gray} />
          <Text style={styles.naoContadoText}>Aguardando contagem</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Render para itens contados
  const diferencaFormatada = formatarDiferenca(resultado.diferenca);
  const corSituacao = getCorSituacao(resultado.situacao);

  return (
    <TouchableOpacity 
      style={[
        styles.itemCard,
        styles.itemCardContado
      ]}
      onPress={handlePressCard}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemCodigo}>{produto.cod}</Text>
          <View style={[styles.situacaoBadge, { backgroundColor: corSituacao + '20' }]}>
            <Text style={[styles.situacaoText, { color: corSituacao }]}>
              {resultado.situacao}
            </Text>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            onPress={handleEditar}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRemover}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.itemNome}>{produto.nome}</Text>
      <Text style={styles.itemUnidade}>Unidade: {produto.unid}</Text>

      <View style={styles.itemDetalhes}>
        <View style={styles.itemDetalhe}>
          <Text style={styles.detalheLabel}>Físico:</Text>
          <Text style={styles.detalheValor}>
            {itemContado.fisico.paletes > 0 && `${itemContado.fisico.paletes}p `}
            {itemContado.fisico.caixas > 0 && `${itemContado.fisico.caixas}cx `}
            {itemContado.fisico.unidades > 0 && `${itemContado.fisico.unidades}un`}
          </Text>
        </View>
        
        <View style={styles.itemDetalhe}>
          <Text style={styles.detalheLabel}>Spalm:</Text>
          <Text style={styles.detalheValor}>{itemContado.spalm}</Text>
        </View>
        
        <View style={styles.itemDetalhe}>
          <Text style={styles.detalheLabel}>Total:</Text>
          <Text style={styles.detalheValor}>{resultado.totalGeral}</Text>
        </View>

        <View style={[styles.itemDetalhe, styles.diferencaDetalhe]}>
          <Text style={styles.detalheLabel}>Diferença:</Text>
          <Text style={[styles.detalheValor, { color: corSituacao, fontWeight: '700' }]}>
            {diferencaFormatada}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ItemCard = memo(ItemCardComponent);

// Styles adicionais
const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  itemCardContado: {
    borderColor: colors.success,
    backgroundColor: colors.white,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemCodigo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  itemContadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  itemContadoText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  itemNome: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  itemUnidade: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 8,
  },
  itemDetalhes: {
    backgroundColor: colors.lighterGray,
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  itemDetalhe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detalheLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  detalheValor: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});