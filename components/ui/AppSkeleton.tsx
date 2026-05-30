import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { RADIUS } from '@/constants/theme';

interface AppSkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function AppSkeleton({
  width,
  height,
  borderRadius = RADIUS.sm,
  style,
}: AppSkeletonProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const backgroundColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F3F4F6', '#E5E7EB'],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}
