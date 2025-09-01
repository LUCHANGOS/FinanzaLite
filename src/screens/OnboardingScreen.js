import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useFinance } from '../context/FinanceContext';

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    title: '¡Bienvenido a FinanzaLite!',
    description: 'La app que te ayudará a organizar tus finanzas personales de manera sencilla y efectiva.',
    icon: '💰',
  },
  {
    title: 'Registra tus ingresos',
    description: 'Añade tu sueldo, bonos y otras fuentes de ingresos para tener un control total.',
    icon: '💼',
  },
  {
    title: 'Controla tus gastos',
    description: 'Categoriza tus gastos fijos y variables para saber exactamente en qué gastas tu dinero.',
    icon: '📊',
  },
  {
    title: 'Visualiza tu progreso',
    description: 'Ve gráficos de tus finanzas y exporta reportes para un mejor análisis.',
    icon: '📈',
  },
  {
    title: '¡Todo listo!',
    description: 'Ahora puedes comenzar a usar FinanzaLite y tomar control de tus finanzas.',
    icon: '🎉',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { updateSettings } = useFinance();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtextColor = isDark ? '#CCCCCC' : '#666666';

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
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
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.stepIndicator}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index <= currentStep 
                    ? '#2196F3' 
                    : isDark ? '#444' : '#DDD'
                }
              ]}
            />
          ))}
        </View>

        <View style={styles.stepContent}>
          <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
          <Text style={[styles.title, { color: textColor }]}>
            {currentStepData.title}
          </Text>
          <Text style={[styles.description, { color: subtextColor }]}>
            {currentStepData.description}
          </Text>
        </View>
      </View>

      <View style={styles.buttons}>
        {currentStep < onboardingSteps.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: isDark ? '#AAA' : '#666' }]}>
              Saltar
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {currentStep < onboardingSteps.length - 1 ? 'Siguiente' : 'Comenzar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    marginBottom: 60,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  stepContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stepIcon: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  skipButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    marginLeft: 20,
    alignItems: 'center',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
