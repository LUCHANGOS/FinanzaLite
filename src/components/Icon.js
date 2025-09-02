import React from 'react';
import { Text, View, useColorScheme } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polygon } from 'react-native-svg';
import { getTheme, Colors } from '../constants/Theme';

// Definición de iconos SVG personalizados
const IconSVGs = {
  dashboard: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" fill={color} />
      <Rect x="14" y="3" width="7" height="7" rx="1" fill={color} />
      <Rect x="3" y="14" width="7" height="7" rx="1" fill={color} />
      <Rect x="14" y="14" width="7" height="7" rx="1" fill={color} />
    </Svg>
  ),
  
  transactions: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth="2" fill="none" />
      <Line x1="2" y1="9" x2="22" y2="9" stroke={color} strokeWidth="2" />
      <Path d="M16 13h2m-10 0h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  ),
  
  categories: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
      <Polygon points="10,15 21,15 15.5,25" stroke={color} strokeWidth="2" fill="none" />
      <Line x1="2" y1="13" x2="6" y2="21" stroke={color} strokeWidth="2" />
      <Line x1="6" y1="13" x2="2" y2="21" stroke={color} strokeWidth="2" />
    </Svg>
  ),
  
  settings: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-3.5L19 10l-3.5 3.5L12 10l3.5-3.5zM8.5 17.5L5 21l3.5-3.5L12 21l-3.5-3.5z" stroke={color} strokeWidth="2" />
    </Svg>
  ),
  
  income: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="19" x2="12" y2="5" stroke={color} strokeWidth="2" />
      <Polygon points="5,12 12,5 19,12" stroke={color} strokeWidth="2" fill={color} />
    </Svg>
  ),
  
  expense: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" />
      <Polygon points="5,12 12,19 19,12" stroke={color} strokeWidth="2" fill={color} />
    </Svg>
  ),
  
  add: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <Line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="2" />
      <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="2" />
    </Svg>
  ),
  
  edit: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  ),
  
  delete: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  ),
  
  chart: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="2" />
      <Line x1="6" y1="20" x2="6" y2="14" stroke={color} strokeWidth="2" />
    </Svg>
  ),
};

export default function Icon({
  name,
  size = 24,
  color,
  emoji,
  style,
  background,
  borderRadius = 'md',
}) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  
  const iconColor = color || theme.colors.text;
  const iconSize = typeof size === 'string' ? theme.spacing[size] || 24 : size;
  
  // Si es un emoji, renderizar como texto
  if (emoji) {
    const containerStyle = [
      {
        width: iconSize + 8,
        height: iconSize + 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: background,
        borderRadius: typeof borderRadius === 'string' ? theme.borderRadius[borderRadius] : borderRadius,
      },
      style,
    ];

    return (
      <View style={containerStyle}>
        <Text style={{ fontSize: iconSize * 0.7 }}>{emoji}</Text>
      </View>
    );
  }
  
  // Si es un SVG personalizado
  if (IconSVGs[name]) {
    const containerStyle = [
      {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: background,
        borderRadius: typeof borderRadius === 'string' ? theme.borderRadius[borderRadius] : borderRadius,
        padding: background ? theme.spacing.xs : 0,
      },
      style,
    ];

    return (
      <View style={containerStyle}>
        {IconSVGs[name](iconSize, iconColor)}
      </View>
    );
  }
  
  // Fallback a emoji por defecto
  return (
    <View style={[
      {
        width: iconSize + 8,
        height: iconSize + 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: background,
        borderRadius: typeof borderRadius === 'string' ? theme.borderRadius[borderRadius] : borderRadius,
      },
      style,
    ]}>
      <Text style={{ fontSize: iconSize * 0.7, color: iconColor }}>📊</Text>
    </View>
  );
}
