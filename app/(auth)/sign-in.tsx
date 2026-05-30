import { useSignIn } from '@clerk/expo/legacy';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppText, AppInput, SocialButton } from '@/components/ui';
import { useOAuthFlow } from '@/lib/auth/useOAuthFlow';
import { COLOURS, SPACING } from '@/constants/theme';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { startOAuth, loading: oauthLoading, error: oauthError } = useOAuthFlow();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(app)');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? 'Sign in failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLOURS.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          className="flex-1"
          style={{ paddingHorizontal: SPACING.xxl }}
          contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="items-center" style={{ marginBottom: 40 }}>
            <Image
              source={require('@/assets/images/auth-logo.png')}
              style={{ width: 200, height: 59, marginBottom: SPACING.md }}
              resizeMode="contain"
            />
            <AppText variant="caption" muted>Personal Finance Tracker</AppText>
          </View>

          {/* Section header */}
          <AppText variant="bodyLarge" style={{ marginBottom: SPACING.xxl }}>
            Sign in to your account
          </AppText>

          {/* OAuth error */}
          {oauthError ? (
            <AppText variant="caption" danger style={{ marginBottom: SPACING.lg, textAlign: 'center' }}>
              {oauthError}
            </AppText>
          ) : null}

          {/* Social buttons */}
          <View style={{ gap: SPACING.md, marginBottom: SPACING.xxl }}>
            <SocialButton
              provider="google"
              onPress={() => startOAuth('oauth_google')}
              loading={oauthLoading === 'oauth_google'}
              disabled={oauthLoading !== null}
            />
            <SocialButton
              provider="apple"
              onPress={() => startOAuth('oauth_apple')}
              loading={oauthLoading === 'oauth_apple'}
              disabled={oauthLoading !== null}
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center" style={{ marginBottom: SPACING.xxl }}>
            <View className="flex-1" style={{ height: 1, backgroundColor: COLOURS.border }} />
            <AppText variant="caption" muted style={{ marginHorizontal: SPACING.lg }}>or</AppText>
            <View className="flex-1" style={{ height: 1, backgroundColor: COLOURS.border }} />
          </View>

          {/* Email/password form */}
          <View style={{ gap: SPACING.lg, marginBottom: SPACING.lg }}>
            <AppInput
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              blurOnSubmit={false}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
            />
            <AppInput
              label="Password"
              placeholder="Your password"
              secureTextEntry
              autoComplete="current-password"
              returnKeyType="done"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
            />
          </View>

          {/* Error */}
          {error ? (
            <AppText variant="caption" danger style={{ marginBottom: SPACING.lg, textAlign: 'center' }}>
              {error}
            </AppText>
          ) : null}

          <AppButton
            title="Sign in"
            onPress={onSignIn}
            loading={loading}
            disabled={!email || !password || oauthLoading !== null}
          />

          <View className="flex-row justify-center" style={{ marginTop: SPACING.xxxl }}>
            <AppText variant="body" muted>
              Don't have an account?{' '}
            </AppText>
            <Link href="/(auth)/sign-up" asChild>
              <AppText variant="body" accent>
                Sign up
              </AppText>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
