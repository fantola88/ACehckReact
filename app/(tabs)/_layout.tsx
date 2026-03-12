// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { colors } from '../../styles/colors';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // No Android, insets.bottom é a altura da barra de navegação do sistema
  const systemBarHeight = Platform.OS === 'android' ? insets.bottom : 0;
  
  // Altura total = tab bar (60) + barra do sistema
  const tabBarHeight = 60;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = 'cube';
            if (route.name === 'contagem') iconName = focused ? 'calculator' : 'calculator-outline';
            else if (route.name === 'relatorios') iconName = focused ? 'document-text' : 'document-text-outline';
            else if (route.name === 'itens') iconName = focused ? 'cube' : 'cube-outline';
            else if (route.name === 'configuracoes') iconName = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.primary,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 2,
            borderTopColor: colors.lightGray,
            height: tabBarHeight,
            paddingBottom: 8,
            paddingTop: 8,
            marginBottom: systemBarHeight,
          },
          // Header personalizado sem botão de logout
          header: () => <AppHeader />,
          contentStyle: {
            backgroundColor: colors.bg,
          },
        })}
      >
        <Tabs.Screen 
          name="contagem" 
          options={{ 
            title: 'Contagem',
          }} 
        />
        <Tabs.Screen 
          name="relatorios" 
          options={{ 
            title: 'Relatórios',
          }} 
        />
        <Tabs.Screen 
          name="itens" 
          options={{ 
            title: 'Itens',
          }} 
        />
        <Tabs.Screen 
          name="configuracoes" 
          options={{ 
            title: 'Config.',
          }} 
        />
      </Tabs>
    </View>
  );
}