import { useAuth } from '@clerk/expo';
import { Redirect, Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/ui/CustomTabBar';

const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Separated so useAuth() only runs inside <ClerkProvider>
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  return <>{children}</>;
}

function TabNavigator() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, lazy: true }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
      <Tabs.Screen name="add" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ title: 'Categories' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

export default function AppLayout() {
  if (clerkKey) {
    return (
      <AuthGuard>
        <TabNavigator />
      </AuthGuard>
    );
  }
  return <TabNavigator />;
}
