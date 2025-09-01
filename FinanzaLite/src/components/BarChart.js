import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

export default function BarChart({ data, height = 200, width = 300 }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={[styles.noDataText, { color: isDark ? '#fff' : '#000' }]}>
          No hay datos para mostrar
        </Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const barWidth = (width - 60) / data.length - 10;
  const chartHeight = height - 40;

  const colors = {
    income: '#4CAF50',
    expense: '#F44336',
    default: '#2196F3'
  };

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
          const x = 30 + index * (barWidth + 10);
          const y = height - barHeight - 20;
          
          const color = colors[item.type] || colors.default;

          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx={4}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 5}
                fill={isDark ? '#fff' : '#000'}
                fontSize="10"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={y - 5}
                fill={isDark ? '#fff' : '#000'}
                fontSize="10"
                textAnchor="middle"
              >
                ${item.value.toLocaleString()}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
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
