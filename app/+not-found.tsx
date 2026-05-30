import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppText, AppButton } from '@/components/ui';
import { COLOURS, SPACING } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLOURS.background, paddingHorizontal: SPACING.xxl }}>
        <AppText variant="h2" style={{ marginBottom: SPACING.sm }}>Page not found</AppText>
        <AppText variant="body" muted style={{ textAlign: 'center', marginBottom: SPACING.xxxl }}>
          The screen you're looking for doesn't exist.
        </AppText>
        <AppButton
          title="Go to Dashboard"
          onPress={() => router.replace('/')}
        />
      </View>
    </>
  );
}
