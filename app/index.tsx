// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Redireciona automaticamente para a aba central
  return <Redirect href="/(tabs)/central" />;
}