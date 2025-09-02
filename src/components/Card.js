import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme, Colors } from '../constants/Theme';

export default function Card({ 
  children, 
  style, 
  gradient, 
  shadowLevel = 'md',
  padding = 'md',
  borderRadius = 'lg',
  ...props 
}) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  const paddingValue = typeof padding === 'string' ? theme.spacing[padding] : padding;
  const radiusValue = typeof borderRadius === 'string' ? theme.borderRadius[borderRadius] : borderRadius;
  const shadowStyle = theme.shadows[shadowLevel] || theme.shadows.md;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.card,
      borderRadius: radiusValue,
      padding: paddingValue,
      ...shadowStyle,
    },
    style,
  ];

  if (gradient) {
    const gradientColors = Array.isArray(gradient) ? gradient : Colors.gradients[gradient] || Colors.gradients.primary;
    
    return (
      <LinearGradient
        colors={gradientColors}
        style={cardStyle}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
  },
});
