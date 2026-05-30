import { Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLOURS, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';
import { AppText } from './AppText';

const ACTIVE_COLOUR = COLOURS.accent;
const INACTIVE_COLOUR = COLOURS.textMuted;

const TAB_CONFIG: Record<string, {
  label: string;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
}> = {
  index: { label: 'Dashboard', iconActive: 'home', iconInactive: 'home-outline' },
  transactions: { label: 'Transactions', iconActive: 'swap-horizontal', iconInactive: 'swap-horizontal-outline' },
  categories: { label: 'Categories', iconActive: 'grid', iconInactive: 'grid-outline' },
  settings: { label: 'Settings', iconActive: 'settings', iconInactive: 'settings-outline' },
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: COLOURS.surface,
        borderTopWidth: 1,
        borderTopColor: COLOURS.border,
        height: 84,
        paddingBottom: 24,
        paddingTop: 8,
        alignItems: 'center',
        overflow: 'visible',
        ...Platform.select({
          ios: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          android: {
            elevation: 8,
          },
        }),
      }}
    >
      {state.routes.map((route, index) => {
        // FAB — centre add button
        if (route.name === 'add') {
          return (
            <View
              key="fab"
              style={{
                flex: 1,
                alignItems: 'center',
                overflow: 'visible',
                zIndex: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push('/add-transaction')}
                activeOpacity={0.8}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: COLOURS.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -28,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                    },
                    android: { elevation: 10 },
                  }),
                }}
              >
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        }

        const config = TAB_CONFIG[route.name];
        if (!config) return null;

        const isFocused = state.index === index;
        const iconName = isFocused ? config.iconActive : config.iconInactive;
        const colour = isFocused ? ACTIVE_COLOUR : INACTIVE_COLOUR;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={config.label}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <View
              style={{
                backgroundColor: isFocused ? COLOURS.accentLight : 'transparent',
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 4,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 2,
              }}
            >
              <Ionicons name={iconName} size={22} color={colour} />
            </View>
            <AppText
              style={{
                fontFamily: TYPOGRAPHY.semibold.fontFamily,
                fontSize: FONT_SIZES.xs,
                color: colour,
                marginTop: 0,
              }}
            >
              {config.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
