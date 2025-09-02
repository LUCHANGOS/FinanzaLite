import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { getTheme, Colors } from '../constants/Theme';

export default function Loading({ 
  text = 'Cargando...', 
  subtext,
  showLogo = true,
  gradient = Colors.gradients.primary 
}) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de rotación continua
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Animación de escala pulsante
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    rotateLoop.start();
    scaleLoop.start();

    return () => {
      rotateLoop.stop();
      scaleLoop.stop();
    };
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <Animatable.View 
        animation="fadeIn" 
        duration={1000}
        style={styles.content}
      >
        {showLogo && (
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                transform: [
                  { rotate: rotation },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <View style={styles.logoBackground}>
              <Text style={styles.logoText}>FL</Text>
            </View>
          </Animated.View>
        )}
        
        <Animatable.Text 
          animation="pulse" 
          iterationCount="infinite"
          style={styles.loadingText}
        >
          {text}
        </Animatable.Text>
        
        {subtext && (
          <Text style={styles.subtext}>
            {subtext}
          </Text>
        )}
        
        {/* Barra de progreso animada */}
        <View style={styles.progressBarContainer}>
          <Animatable.View 
            animation="slideInRight"
            iterationCount="infinite"
            duration={1500}
            style={styles.progressBar}
          />
        </View>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});
