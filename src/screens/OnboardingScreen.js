import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useFinance } from '../context/FinanceContext';
import { getTheme, Colors } from '../constants/Theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    title: '¡Bienvenido a FinanzaLite!',
    subtitle: 'by L.A.N.G.',
    description: 'La app que te ayudará a organizar tus finanzas personales de manera sencilla y efectiva.',
    icon: '💰',
    gradient: Colors.gradients.primary,
    showLogo: true,
  },
  {
    title: 'Registra tus ingresos',
    description: 'Añade tu sueldo, bonos y otras fuentes de ingresos para tener un control total de tu dinero.',
    icon: '💼',
    gradient: Colors.gradients.income,
  },
  {
    title: 'Controla tus gastos',
    description: 'Categoriza tus gastos fijos y variables para saber exactamente en qué inviertes tu dinero.',
    icon: '📊',
    gradient: Colors.gradients.warning,
  },
  {
    title: 'Visualiza tu progreso',
    description: 'Ve gráficos detallados de tus finanzas y exporta reportes para un mejor análisis.',
    icon: '📈',
    gradient: Colors.gradients.secondary,
  },
  {
    title: '¡Todo listo!',
    description: 'Ahora puedes comenzar a usar FinanzaLite y tomar control total de tus finanzas.',
    icon: '🎉',
    gradient: Colors.gradients.success,
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { updateSettings } = useFinance();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
  };

  const completeOnboarding = () => {
    updateSettings({ firstTimeUser: false });
    if (onComplete) {
      onComplete();
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <LinearGradient
      colors={currentStepData.gradient}
      style={styles.container}
    >
      {/* Header con indicador de progreso */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => (
            <Animatable.View
              key={index}
              animation={index <= currentStep ? 'bounceIn' : undefined}
              delay={index * 100}
            >
              <View style={[
                styles.progressDot,
                {
                  backgroundColor: index <= currentStep 
                    ? '#FFFFFF' 
                    : 'rgba(255, 255, 255, 0.3)',
                  transform: [{ scale: index === currentStep ? 1.2 : 1 }],
                }
              ]} />
            </Animatable.View>
          ))}
        </View>
        
        {currentStep > 0 && (
          <TouchableOpacity 
            onPress={handleSkip} 
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido principal */}
      <Animatable.View 
        key={currentStep}
        animation="fadeInUp"
        duration={600}
        style={styles.content}
      >
        {/* Logo especial para la primera pantalla */}
        {currentStepData.showLogo && (
          <Animatable.View 
            animation="bounceIn" 
            delay={300}
            style={styles.logoContainer}
          >
            <View style={styles.logoBackground}>
              <Icon name="chart" size={60} color="#FFFFFF" />
            </View>
          </Animatable.View>
        )}
        
        {/* Icono principal */}
        {!currentStepData.showLogo && (
          <Animatable.View 
            animation="bounceIn" 
            delay={200}
            style={styles.iconContainer}
          >
            <View style={styles.iconBackground}>
              <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
            </View>
          </Animatable.View>
        )}

        {/* Texto principal */}
        <Animatable.View 
          animation="slideInUp" 
          delay={400}
          style={styles.textContainer}
        >
          <Text style={styles.title}>
            {currentStepData.title}
          </Text>
          
          {currentStepData.subtitle && (
            <Text style={styles.subtitle}>
              {currentStepData.subtitle}
            </Text>
          )}
          
          <Text style={styles.description}>
            {currentStepData.description}
          </Text>
        </Animatable.View>
      </Animatable.View>

      {/* Botones de navegación */}
      <Animatable.View 
        animation="slideInUp" 
        delay={600}
        style={styles.buttonContainer}
      >
        <Button
          title={currentStep < onboardingSteps.length - 1 ? 'Siguiente' : '¡Comenzar!'}
          onPress={handleNext}
          variant="secondary"
          size="lg"
          style={styles.nextButton}
          textStyle={{ color: '#FFFFFF' }}
          gradient={false}
        />
        
        {/* Indicador de paso */}
        <Text style={styles.stepCounter}>
          {currentStep + 1} de {onboardingSteps.length}
        </Text>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIcon: {
    fontSize: 50,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    color: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  stepCounter: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
  },
});
