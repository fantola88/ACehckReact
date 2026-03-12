// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';

// Providers
import { AuthProvider } from '../contexts/AuthContext';
import { InventariantesProvider } from '../contexts/InventariantesContext';
import { PreferenciasProvider } from '../contexts/PreferenciasContext';
import { RelatorioProvider } from '../contexts/RelatorioContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <AuthProvider>
        <PreferenciasProvider> {/* PreferenciasProvider antes dos outros */}
          <InventariantesProvider>
            <RelatorioProvider>
              <View style={styles.container}>
                <Stack
                  screenOptions={{
                    headerStyle: {
                      backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.white,
                    headerTitleStyle: {
                      fontWeight: 'bold',
                      fontSize: 18,
                    },
                    headerTitleAlign: 'center',
                    contentStyle: {
                      backgroundColor: colors.bg,
                    },
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen
                    name="(auth)"
                    options={{
                      headerShown: false,
                    }}
                  />
                  
                  <Stack.Screen
                    name="(tabs)"
                    options={{
                      headerShown: false,
                    }}
                  />
                  
                  <Stack.Screen
                    name="modal/inventariante"
                    options={{
                      presentation: 'modal',
                      title: 'Gerenciar Inventariantes',
                      headerStyle: {
                        backgroundColor: colors.primary,
                      },
                    }}
                  />
                  
                  <Stack.Screen
                    name="modal/editar-produto"
                    options={{
                      presentation: 'modal',
                      title: 'Editar Produto',
                      headerStyle: {
                        backgroundColor: colors.primary,
                      },
                    }}
                  />
                  
                  <Stack.Screen
                    name="modal/editar-relatorio"
                    options={{
                      presentation: 'modal',
                      title: 'Editar Item',
                      headerStyle: {
                        backgroundColor: colors.primary,
                      },
                    }}
                  />
                </Stack>
              </View>
            </RelatorioProvider>
          </InventariantesProvider>
        </PreferenciasProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});