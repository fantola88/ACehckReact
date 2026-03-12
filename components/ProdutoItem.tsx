// components/ProdutoItem.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Produto } from '../data/types';
import { colors } from '../styles/colors';

interface ProdutoItemProps {
  item: Produto;
  onEdit: (produto: Produto) => void;
  onDelete: (produto: Produto) => void;
}

const ProdutoItemComponent = ({ item, onEdit, onDelete }: ProdutoItemProps) => {
  return (
    <View style={styles.produtoItem}>
      <View style={styles.produtoInfo}>
        <Text style={styles.produtoCodigo}>{item.cod}</Text>
        <Text style={styles.produtoNome} numberOfLines={2}>
          {item.nome}
        </Text>
        <View style={styles.produtoFooter}>
          <Text style={styles.produtoUnidade}>{item.unid}</Text>
          <Text style={styles.produtoAlmox}>{item.almox}</Text>
        </View>
      </View>
      
      <View style={styles.produtoActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(item)}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  produtoInfo: {
    flex: 1,
    marginRight: 8,
  },
  produtoCodigo: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  produtoNome: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  produtoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  produtoUnidade: {
    fontSize: 10,
    color: colors.gray,
    backgroundColor: colors.lighterGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  produtoAlmox: {
    fontSize: 10,
    color: colors.gray,
  },
  produtoActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
  },
  editButton: {
    borderColor: colors.primary,
  },
  deleteButton: {
    borderColor: colors.danger,
  },
});

// IMPORTANTE: memo para evitar re-renders desnecessários
export const ProdutoItem = memo(ProdutoItemComponent);