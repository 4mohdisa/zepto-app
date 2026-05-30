import { Alert, Image, Linking, View } from 'react-native';
import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  AppText,
  AppCard,
  AppListRow,
  AppSectionHeader,
} from '@/components/ui';
import { COLOURS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const fullName = user?.fullName ?? user?.firstName ?? 'User';
  const imageUrl = user?.imageUrl;
  const initial = fullName[0]?.toUpperCase() ?? 'U';

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open', 'This link is not available yet.');
      }
    } catch {
      Alert.alert('Unable to open', 'This link is not available yet.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/sign-in'); } },
    ]);
  };

  return (
    <ScreenContainer scrollable>
      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm }}>
        <AppText variant="h1" style={{ marginBottom: SPACING.xxl }}>Settings</AppText>

        {/* Profile Card */}
        <AppCard padding="md" style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.xxxl }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 56, height: 56, borderRadius: RADIUS.full }}
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: RADIUS.full,
                backgroundColor: COLOURS.accentLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText
                style={{
                  fontFamily: TYPOGRAPHY.bold.fontFamily,
                  fontSize: FONT_SIZES.xl,
                  color: COLOURS.accent,
                }}
              >
                {initial}
              </AppText>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <AppText variant="label" style={{ fontSize: FONT_SIZES.lg }}>{fullName}</AppText>
            <AppText variant="caption" muted>{email}</AppText>
          </View>
        </AppCard>

        {/* General */}
        <AppSectionHeader title="General" />
        <AppCard padding="none" style={{ marginBottom: SPACING.xxl }}>
          <AppListRow
            title="Merchants"
            leftIcon={<Ionicons name="storefront-outline" size={20} color={COLOURS.accent} />}
            leftIconBackground={COLOURS.accentLight}
            showChevron
            showDivider
            onPress={() => router.push('/settings/merchants')}
          />
          <AppListRow
            title="Recurring Transactions"
            leftIcon={<Ionicons name="repeat-outline" size={20} color={COLOURS.accent} />}
            leftIconBackground={COLOURS.accentLight}
            showChevron
            onPress={() => router.push('/settings/recurring')}
          />
        </AppCard>

        {/* Support */}
        <AppSectionHeader title="Support" />
        <AppCard padding="none" style={{ marginBottom: SPACING.xxl }}>
          <AppListRow
            title="Send Feedback"
            leftIcon={<Ionicons name="chatbubble-ellipses-outline" size={20} color={COLOURS.accent} />}
            leftIconBackground={COLOURS.accentLight}
            showChevron
            showDivider
            onPress={() => router.push('/settings/feedback')}
          />
          <AppListRow
            title="Contact Us"
            leftIcon={<Ionicons name="mail-outline" size={20} color={COLOURS.accent} />}
            leftIconBackground={COLOURS.accentLight}
            showChevron
            showDivider
            onPress={() => openURL('mailto:support@trackr.ai?subject=Trackr AI Support')}
          />
          <AppListRow
            title="Privacy Policy"
            leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={COLOURS.accent} />}
            leftIconBackground={COLOURS.accentLight}
            showChevron
            onPress={() => openURL('https://trackr.ai/privacy')}
          />
        </AppCard>

        {/* Account */}
        <AppSectionHeader title="Account" />
        <AppCard padding="none" style={{ marginBottom: SPACING.xxxl }}>
          <AppListRow
            title="Sign Out"
            leftIcon={<Ionicons name="log-out-outline" size={20} color={COLOURS.error} />}
            leftIconBackground={COLOURS.errorLight}
            onPress={handleSignOut}
          />
        </AppCard>

        {/* Footer */}
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.body.fontFamily,
            fontSize: FONT_SIZES.sm,
            color: COLOURS.textMuted,
            textAlign: 'center',
            marginBottom: SPACING.xxl,
          }}
        >
          Trackr AI v1.0.0
        </AppText>
      </View>
    </ScreenContainer>
  );
}
