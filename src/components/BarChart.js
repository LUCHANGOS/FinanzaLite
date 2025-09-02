import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useColorScheme, Animated } from 'react-native';
import Svg, { Rect, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Animatable from 'react-native-animatable';
import { getTheme, Colors } from '../constants/Theme';

export default function BarChart({ data, height = 200, width = 300 }) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animar las barras cuando cambian los datos
    animatedValues.forEach((animValue, index) => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 800 + (index * 200),
        useNativeDriver: false,
      }).start();
    });
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Animatable.View animation="fadeIn" style={[styles.container, { height }]}>
        <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
          No hay datos para mostrar
        </Text>
      </Animatable.View>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const barWidth = Math.max(40, (width - 80) / data.length - 20);
  const chartHeight = height - 80;

  const getGradientId = (type) => `gradient_${type}`;
  const getGradientColors = (type) => {
    switch (type) {
      case 'income':
        return Colors.gradients.income;
      case 'expense':
        return Colors.gradients.error;
      default:
        return Colors.gradients.secondary;
    }
  };

  return (
    <Animatable.View animation="fadeInUp" style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          {/* Definir gradientes para cada tipo */}
          {data.map((item, index) => {
            const gradientColors = getGradientColors(item.type);
            return (
              <SvgLinearGradient
                key={getGradientId(item.type + index)}
                id={getGradientId(item.type + index)}
                x1="0%" y1="0%" x2="0%" y2="100%"
              >
                <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="1" />
                <Stop offset="100%" stopColor={gradientColors[1]} stopOpacity="0.8" />
              </SvgLinearGradient>
            );
          })}
        </Defs>
        
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
          const spacing = (width - (data.length * barWidth)) / (data.length + 1);
          const x = spacing + index * (barWidth + spacing);
          const y = height - barHeight - 60;
          
          return (
            <React.Fragment key={index}>
              {/* Barra con gradiente */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#${getGradientId(item.type + index)})`}
                rx={8}
                ry={8}
              />
              
              {/* Etiqueta del valor */}
              <SvgText
                x={x + barWidth / 2}
                y={y - 8}
                fill={theme.colors.text}
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                ${item.value > 0 ? item.value.toLocaleString() : '0'}
              </SvgText>
              
              {/* Etiqueta del nombre */}
              <SvgText
                x={x + barWidth / 2}
                y={height - 20}
                fill={theme.colors.textSecondary}
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
              
              {/* Línea base */}
              <Rect
                x={x}
                y={height - 40}
                width={barWidth}
                height={2}
                fill={theme.colors.border}
                opacity={0.3}
              />
            </React.Fragment>
          );
        })}
        
        {/* Línea base principal */}
        <Rect
          x={20}
          y={height - 40}
          width={width - 40}
          height={1}
          fill={theme.colors.border}
          opacity={0.5}
        />
      </Svg>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});
