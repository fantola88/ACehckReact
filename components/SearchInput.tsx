// components/SearchInput.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { colors } from '../styles/colors';

export interface SearchItem {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  [key: string]: any;
}

interface SearchInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onSelect: (item: SearchItem) => void;
  onSearch: (text: string) => Promise<SearchItem[]>;
  onClear?: () => void;
  loading?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minChars?: number;
  debounceMs?: number;
  showClearButton?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  listStyle?: ViewStyle;
  renderItem?: (item: SearchItem) => React.ReactNode;
  keyExtractor?: (item: SearchItem) => string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  label,
  placeholder = 'Pesquisar...',
  value,
  onSelect,
  onSearch,
  onClear,
  loading = false,
  error,
  required = false,
  disabled = false,
  minChars = 2,
  debounceMs = 500,
  showClearButton = true,
  style,
  inputStyle,
  listStyle,
  renderItem,
  keyExtractor = (item) => item.id,
}) => {
  const [text, setText] = useState(value);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchItem | null>(null);
  
  const searchTimeout = useRef<NodeJS.Timeout>();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleTextChange = async (newText: string) => {
    setText(newText);
    setSelected(null);
    
    if (onClear && newText === '') {
      onClear();
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (newText.length >= minChars) {
      setSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const searchResults = await onSearch(newText);
          setResults(searchResults);
          setShowResults(true);
        } catch (err) {
          console.error('Erro na busca:', err);
        } finally {
          setSearching(false);
        }
      }, debounceMs);
    } else {
      setResults([]);
      setShowResults(false);
      setSearching(false);
    }
  };

  const handleSelectItem = (item: SearchItem) => {
    setText(item.codigo);
    setSelected(item);
    setShowResults(false);
    onSelect(item);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setText('');
    setSelected(null);
    setResults([]);
    setShowResults(false);
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const defaultRenderItem = (item: SearchItem) => (
    <View style={styles.resultItem}>
      <View style={styles.resultCodigoContainer}>
        <Text style={styles.resultCodigo}>{item.codigo}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultNome} numberOfLines={2}>
          {item.nome}
        </Text>
        <Text style={styles.resultUnidade}>{item.unidade}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray} />
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputError,
        disabled && styles.inputDisabled,
      ]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={colors.gray} 
          style={styles.searchIcon}
        />
        
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle]}
          value={text}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.lightGray}
          editable={!disabled}
          onFocus={() => {
            if (text.length >= minChars && results.length > 0) {
              setShowResults(true);
            }
          }}
        />
        
        {searching && (
          <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIcon} />
        )}
        
        {showClearButton && text.length > 0 && !searching && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {/* Modal de resultados */}
      <Modal
        visible={showResults}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResults(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowResults(false)}
        >
          <View style={[styles.resultsContainer, listStyle]}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowResults(false)}>
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={results}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectItem(item)}
                  activeOpacity={0.7}
                >
                  {renderItem ? renderItem(item) : defaultRenderItem(item)}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={40} color={colors.lightGray} />
                  <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
                </View>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  required: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: colors.lighterGray,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 12,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultsContainer: {
    backgroundColor: colors.white,
    borderRadius: 18,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.lighterGray,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  resultCodigoContainer: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  resultCodigo: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  resultInfo: {
    flex: 1,
    marginRight: 8,
  },
  resultNome: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  resultUnidade: {
    fontSize: 11,
    color: colors.gray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SearchInput;