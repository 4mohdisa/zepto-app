import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const config = {
  google: {
    label: 'Continue with Google',
    icon: 'logo-google' as const,
    iconColor: '#4285F4',
    containerClass: 'bg-background border border-border',
    textClass: 'text-foreground',
    spinnerColor: '#111827',
  },
  apple: {
    label: 'Continue with Apple',
    icon: 'logo-apple' as const,
    iconColor: '#FFFFFF',
    containerClass: 'bg-primary',
    textClass: 'text-white',
    spinnerColor: '#FFFFFF',
  },
};

export function SocialButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
}: SocialButtonProps) {
  const { label, icon, iconColor, containerClass, textClass, spinnerColor } = config[provider];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      className={`h-16 px-5 rounded-xl flex-row items-center justify-center gap-3 ${containerClass} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <>
          <View className="w-6 items-center justify-center">
            <Ionicons name={icon} size={22} color={iconColor} />
          </View>
          <AppText variant="label" className={`font-semibold ${textClass}`}>
            {label}
          </AppText>
        </>
      )}
    </TouchableOpacity>
  );
}
