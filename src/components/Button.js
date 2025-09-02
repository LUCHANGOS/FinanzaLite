import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { getTheme, Colors } from '../constants/Theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  gradient = true,
  icon,
  style,
  textStyle,
  hapticFeedback = true,
  animation = 'pulse',
  ...props
}) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [isPressed, setIsPressed] = useState(false);

  const getVariantColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: theme.colors.surface,
          text: Colors.secondary,
          border: Colors.secondary,
          gradient: Colors.gradients.secondary,
        };
      case 'success':
        return {
          background: Colors.success,
          text: '#FFFFFF',
          gradient: Colors.gradients.success,
        };
      case 'warning':
        return {
          background: Colors.warning,
          text: '#FFFFFF',
          gradient: Colors.gradients.warning,
        };
      case 'error':
        return {
          background: Colors.error,
          text: '#FFFFFF',
          gradient: Colors.gradients.error,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: Colors.primary,
          border: 'transparent',
        };
      default: // primary
        return {
          background: Colors.primary,
          text: '#FFFFFF',
          gradient: Colors.gradients.primary,
        };
    }
  };

  const getSizeValues = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          fontSize: 14,
          height: 36,
        };
      case 'lg':
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          fontSize: 18,
          height: 56,
        };
      default: // md
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          fontSize: 16,
          height: 48,
        };
    }
  };

  const colors = getVariantColors();
  const sizeValues = getSizeValues();

  const handlePress = async () => {
    if (disabled || loading) return;

    if (hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    if (onPress) {
      onPress();
    }
  };

  const buttonStyle = [
    styles.button,
    {
      height: sizeValues.height,
      paddingVertical: sizeValues.paddingVertical,
      paddingHorizontal: sizeValues.paddingHorizontal,
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: variant === 'secondary' ? 1 : 0,
      borderRadius: theme.borderRadius.lg,
      opacity: disabled ? 0.6 : isPressed ? 0.8 : 1,
      transform: [{ scale: isPressed ? 0.98 : 1 }],
      ...theme.shadows.md,
    },
    style,
  ];

  const textStyleCombined = [
    styles.text,
    theme.typography.body1,
    {
      color: colors.text,
      fontSize: sizeValues.fontSize,
      fontWeight: '600',
    },
    textStyle,
  ];

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </>
  );

  if (gradient && variant === 'primary' && !disabled) {
    return (
      <Animatable.View animation={animation} duration={200}>
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled || loading}
          style={[buttonStyle, { backgroundColor: 'transparent' }]}
          {...props}
        >
          <LinearGradient
            colors={colors.gradient}
            style={[StyleSheet.absoluteFillObject, { borderRadius: theme.borderRadius.lg }]}
          />
          <ButtonContent />
        </TouchableOpacity>
      </Animatable.View>
    );
  }

  return (
    <Animatable.View animation={animation} duration={200}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        style={buttonStyle}
        {...props}
      >
        <ButtonContent />
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    textAlign: 'center',
    marginLeft: 8,
  },
});
