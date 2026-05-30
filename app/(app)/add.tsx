import { Redirect } from 'expo-router';

// Placeholder route for the center FAB tab.
// This screen is never shown — the FAB in CustomTabBar calls router.push('/add-transaction') instead.
// href: null in _layout.tsx hides this from the tab bar URL routing.
export default function AddPlaceholder() {
  return <Redirect href="/(app)" />;
}
