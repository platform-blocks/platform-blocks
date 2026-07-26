import React from 'react';
import { View, Modal, Pressable, Platform, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../core/theme/ThemeProvider';
import type { MobileMenuConfig } from './types';

interface MobileMenuProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  config?: MobileMenuConfig;
}

const { height: screenHeight } = Dimensions.get('window');

export const MobileMenu: React.FC<MobileMenuProps> = ({
  visible,
  onClose,
  children,
  config = {}
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const {
    type = 'fullscreen',
    animationType = 'slide',
    showBackdrop = true,
    closeOnOutsidePress = true,
    transitionDuration = 300
  } = config;

  const progress = useSharedValue(0);

  React.useEffect(() => {
    const target = visible ? 1 : 0;
    // `transitionDuration={0}` means no transition — jump straight there.
    progress.value = transitionDuration > 0
      ? withTiming(target, { duration: transitionDuration })
      : target;
  }, [visible, transitionDuration, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.5])
  }));

  const containerStyle = useAnimatedStyle(() => {
    if (animationType === 'slide') {
      return {
        transform: [
          { translateY: interpolate(progress.value, [0, 1], [screenHeight, 0]) }
        ]
      };
    } else if (animationType === 'fade') {
      return {
        opacity: progress.value,
        transform: [
          { scale: interpolate(progress.value, [0, 1], [0.95, 1]) }
        ]
      };
    }
    return { opacity: progress.value };
  });

  if (!visible && progress.value === 0) {
    return null;
  }

  if (Platform.OS === 'web') {
    // Web implementation using positioned overlay
    return (
      <View
        style={{
          position: 'fixed' as any,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999
        }}
      >
        {showBackdrop && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)'
              },
              backdropStyle
            ]}
          />
        )}
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: theme.backgrounds.base,
              padding: 16
            },
            containerStyle
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {children}
          </SafeAreaView>
        </Animated.View>
      </View>
    );
  }

  // Native Modal implementation
  return (
    <Modal
      visible={visible}
      animationType="none" // We handle animation ourselves
      transparent={type !== 'fullscreen'}
      statusBarTranslucent={type === 'fullscreen'}
      presentationStyle={type === 'fullscreen' ? 'fullScreen' : 'overFullScreen'}
    >
      <View style={{ flex: 1 }}>
        {showBackdrop && type !== 'fullscreen' && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)'
              },
              backdropStyle
            ]}
          />
        )}

        {closeOnOutsidePress && type !== 'fullscreen' && (
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
            onPress={onClose}
          />
        )}

        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: theme.backgrounds.base,
              ...(type === 'fullscreen'
                ? {}
                : {
                  marginTop: insets.top + 20,
                  marginHorizontal: 16,
                  borderRadius: 12,
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.25)',
                  elevation: 10
                }
              )
            },
            containerStyle
          ]}
        >
          <SafeAreaView style={{ flex: 1 }} edges={type === 'fullscreen' ? ['top', 'bottom'] : []}>
            {children}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};
