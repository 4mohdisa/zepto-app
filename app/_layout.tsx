import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'Clerk: Clerk has been loaded with development keys',
  'Uncaught (in promise',
  'No native splash screen registered',
  '[Layout children]',
  'loadClerkUiScript is not a function',
]);

import '../global.css';
import { ClerkProvider, ClerkLoaded } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/queryClient';
import { useEffect } from 'react';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const modalScreenOptions = {
  presentation: 'card' as const,
  animation: 'slide_from_bottom' as const,
  headerShown: false,
};

const nav = (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(app)" />
    <Stack.Screen name="add-transaction" options={modalScreenOptions} />
    <Stack.Screen name="edit-transaction" options={modalScreenOptions} />
    <Stack.Screen name="add-category" options={modalScreenOptions} />
    <Stack.Screen name="edit-category" options={modalScreenOptions} />
    <Stack.Screen name="add-merchant" options={modalScreenOptions} />
    <Stack.Screen name="edit-merchant" options={modalScreenOptions} />
    <Stack.Screen name="add-recurring" options={modalScreenOptions} />
    <Stack.Screen name="edit-recurring" options={modalScreenOptions} />
    <Stack.Screen name="set-balance" options={modalScreenOptions} />
    <Stack.Screen name="+not-found" />
  </Stack>
);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    DMSerifDisplay_400Regular,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  // When no Clerk key is set (UI preview / local dev), skip auth provider
  if (!clerkKey) return <QueryClientProvider client={queryClient}>{nav}<StatusBar style="dark" /></QueryClientProvider>;

  return (
    <ClerkProvider publishableKey={clerkKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <ClerkLoaded>{nav}</ClerkLoaded>
      </QueryClientProvider>
      <StatusBar style="dark" />
    </ClerkProvider>
  );
}
