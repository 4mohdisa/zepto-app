import { useSignUp } from '@clerk/expo/legacy';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppText, AppInput, SocialButton } from '@/components/ui';
import { useOAuthFlow } from '@/lib/auth/useOAuthFlow';
import { COLOURS, SPACING } from '@/constants/theme';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const { startOAuth, loading: oauthLoading, error: oauthError } = useOAuthFlow();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const onSignUp = async () => {
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? 'Sign up failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(app)');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? 'Invalid code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Email verification step
  if (pendingVerification) {
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

            <AppText variant="h2" style={{ marginBottom: SPACING.sm }}>Check your email</AppText>
            <AppText variant="body" muted style={{ marginBottom: SPACING.xxxl }}>
              We sent a 6-digit code to {email}
            </AppText>

            <View style={{ gap: SPACING.lg, marginBottom: SPACING.lg }}>
              <AppInput
                label="Verification code"
                placeholder="123456"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                returnKeyType="done"
                value={code}
                onChangeText={(t) => { setCode(t); setError(''); }}
              />
            </View>

            {error ? (
              <AppText variant="caption" danger style={{ marginBottom: SPACING.lg, textAlign: 'center' }}>
                {error}
              </AppText>
            ) : null}

            <AppButton
              title="Verify email"
              onPress={onVerify}
              loading={loading}
              disabled={code.length < 6}
            />

            <AppButton
              title="Resend code"
              variant="ghost"
              size="sm"
              style={{ marginTop: SPACING.md }}
              onPress={async () => {
                await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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
            Create your account
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
              placeholder="At least 8 characters"
              secureTextEntry
              autoComplete="new-password"
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
            title="Create account"
            onPress={onSignUp}
            loading={loading}
            disabled={!email || password.length < 8 || oauthLoading !== null}
          />

          <View className="flex-row justify-center" style={{ marginTop: SPACING.xxxl }}>
            <AppText variant="body" muted>
              Already have an account?{' '}
            </AppText>
            <Link href="/(auth)/sign-in" asChild>
              <AppText variant="body" accent>
                Sign in
              </AppText>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
