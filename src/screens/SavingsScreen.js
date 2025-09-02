import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useSavings } from '../context/SavingsContext';
import { getTheme, Colors } from '../constants/Theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

export default function SavingsScreen({ navigation }) {
  const {
    savingsGoals,
    totalSavings,
    monthlyTarget,
    getSavingsAnalytics,
    getActiveGoals,
    getCompletedGoals,
    getGoalProgress,
  } = useSavings();
  
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'goals', 'history'
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  const analytics = getSavingsAnalytics();
  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const renderOverview = () => (
    <View>
      {/* Resumen principal */}
      <Animatable.View animation="fadeInUp" delay={100}>
        <Card 
          gradient={Colors.gradients.success}
          style={styles.mainCard}
          shadowLevel="xl"
        >
          <View style={styles.mainCardHeader}>
            <Icon name="chart" size={24} color="#FFFFFF" />
            <Text style={styles.mainCardTitle}>Total Ahorrado</Text>
          </View>
          <Text style={styles.mainAmount}>
            {formatCurrency(totalSavings)}
          </Text>
          <Text style={styles.mainSubtext}>
            ¡Sigue así! 💪
          </Text>
        </Card>
      </Animatable.View>

      {/* Cards de métricas */}
      <View style={styles.metricsSection}>
        <Animatable.View animation="slideInLeft" delay={200}>
          <Card gradient={Colors.gradients.secondary} style={styles.metricCard}>
            <Icon name="income" size={20} color="#FFFFFF" />
            <Text style={styles.metricTitle}>Este Mes</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(analytics.currentMonthSavings)}
            </Text>
            {monthlyTarget > 0 && (
              <Text style={styles.metricSubtext}>
                {formatPercentage(analytics.targetProgress)} de meta
              </Text>
            )}
          </Card>
        </Animatable.View>

        <Animatable.View animation="slideInRight" delay={300}>
          <Card gradient={Colors.gradients.warning} style={styles.metricCard}>
            <Icon name="categories" size={20} color="#FFFFFF" />
            <Text style={styles.metricTitle}>Metas Activas</Text>
            <Text style={styles.metricValue}>{activeGoals.length}</Text>
            <Text style={styles.metricSubtext}>
              {completedGoals.length} completadas
            </Text>
          </Card>
        </Animatable.View>
      </View>

      {/* Progreso mensual */}
      {monthlyTarget > 0 && (
        <Animatable.View animation="fadeInUp" delay={400}>
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
                Meta Mensual
              </Text>
              <Text style={[styles.progressAmount, { color: Colors.primary }]}>
                {formatCurrency(monthlyTarget)}
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
                <LinearGradient
                  colors={Colors.gradients.success}
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, analytics.targetProgress)}%` }
                  ]}
                />
              </View>
              <Text style={[styles.progressPercentage, { color: theme.colors.textSecondary }]}>
                {formatPercentage(analytics.targetProgress)}
              </Text>
            </View>
          </Card>
        </Animatable.View>
      )}

      {/* Metas destacadas */}
      {activeGoals.length > 0 && (
        <Animatable.View animation="fadeInUp" delay={500}>
          <Card style={styles.goalsPreviewCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Metas en Progreso
              </Text>
              <TouchableOpacity onPress={() => setViewMode('goals')}>
                <Text style={[styles.seeAllText, { color: Colors.primary }]}>
                  Ver todas
                </Text>
              </TouchableOpacity>
            </View>
            
            {activeGoals.slice(0, 3).map((goal, index) => (
              <Animatable.View 
                key={goal.id}
                animation="slideInLeft"
                delay={600 + (index * 100)}
              >
                <View style={styles.goalPreviewItem}>
                  <View style={styles.goalPreviewLeft}>
                    <Text style={styles.goalEmoji}>{goal.icon || '🎯'}</Text>
                    <View>
                      <Text style={[styles.goalName, { color: theme.colors.text }]}>
                        {goal.name}
                      </Text>
                      <Text style={[styles.goalProgress, { color: theme.colors.textSecondary }]}>
                        {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.goalPreviewRight}>
                    <Text style={[styles.goalPercentage, { color: Colors.primary }]}>
                      {formatPercentage(getGoalProgress(goal.id))}
                    </Text>
                    <View style={styles.miniProgressBar}>
                      <View style={[styles.miniProgressFill, { 
                        width: `${getGoalProgress(goal.id)}%`,
                        backgroundColor: Colors.primary
                      }]} />
                    </View>
                  </View>
                </View>
              </Animatable.View>
            ))}
          </Card>
        </Animatable.View>
      )}
    </View>
  );

  const renderGoals = () => (
    <View>
      <Animatable.View animation="fadeInUp">
        <Card style={styles.goalsHeader}>
          <View style={styles.goalsHeaderContent}>
            <View>
              <Text style={[styles.goalsHeaderTitle, { color: theme.colors.text }]}>
                Mis Metas de Ahorro
              </Text>
              <Text style={[styles.goalsHeaderSubtitle, { color: theme.colors.textSecondary }]}>
                {activeGoals.length} activas • {completedGoals.length} completadas
              </Text>
            </View>
            <Button
              title="Nueva Meta"
              size="sm"
              onPress={() => navigation.navigate('AddSavingsGoal')}
              icon={<Icon name="add" size={16} color="#FFFFFF" />}
            />
          </View>
        </Card>
      </Animatable.View>

      {/* Metas activas */}
      {activeGoals.map((goal, index) => (
        <Animatable.View 
          key={goal.id}
          animation="slideInUp"
          delay={100 + (index * 100)}
        >
          <Card style={styles.goalCard}>
            <View style={styles.goalCardHeader}>
              <View style={styles.goalCardLeft}>
                <Text style={styles.goalCardEmoji}>{goal.icon || '🎯'}</Text>
                <View>
                  <Text style={[styles.goalCardName, { color: theme.colors.text }]}>
                    {goal.name}
                  </Text>
                  <Text style={[styles.goalCardDate, { color: theme.colors.textSecondary }]}>
                    Meta: {dayjs(goal.targetDate).format('DD/MM/YYYY')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.goalCardAmount, { color: Colors.primary }]}>
                {formatCurrency(goal.targetAmount)}
              </Text>
            </View>

            <View style={styles.goalProgress}>
              <View style={styles.goalProgressHeader}>
                <Text style={[styles.goalProgressText, { color: theme.colors.textSecondary }]}>
                  {formatCurrency(goal.currentAmount)} ahorrados
                </Text>
                <Text style={[styles.goalProgressPercentage, { color: Colors.primary }]}>
                  {formatPercentage(getGoalProgress(goal.id))}
                </Text>
              </View>
              
              <View style={[styles.goalProgressBar, { backgroundColor: theme.colors.border }]}>
                <LinearGradient
                  colors={Colors.gradients.primary}
                  style={[
                    styles.goalProgressFill,
                    { width: `${getGoalProgress(goal.id)}%` }
                  ]}
                />
              </View>
            </View>
          </Card>
        </Animatable.View>
      ))}

      {/* Metas completadas */}
      {completedGoals.length > 0 && (
        <Animatable.View animation="fadeInUp" delay={300}>
          <Card style={styles.completedGoalsCard}>
            <Text style={[styles.completedTitle, { color: theme.colors.text }]}>
              🏆 Metas Completadas
            </Text>
            {completedGoals.slice(0, 3).map((goal) => (
              <View key={goal.id} style={styles.completedGoalItem}>
                <Text style={styles.completedGoalEmoji}>{goal.icon || '✅'}</Text>
                <View style={styles.completedGoalInfo}>
                  <Text style={[styles.completedGoalName, { color: theme.colors.text }]}>
                    {goal.name}
                  </Text>
                  <Text style={[styles.completedGoalAmount, { color: Colors.success }]}>
                    {formatCurrency(goal.targetAmount)}
                  </Text>
                </View>
                <Text style={[styles.completedGoalDate, { color: theme.colors.textTertiary }]}>
                  {dayjs(goal.completedAt).format('DD/MM')}
                </Text>
              </View>
            ))}
          </Card>
        </Animatable.View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header con navegación */}
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Ahorros</Text>
        <View style={styles.headerTabs}>
          {['overview', 'goals', 'history'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.headerTab,
                viewMode === mode && styles.headerTabActive
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[
                styles.headerTabText,
                { color: viewMode === mode ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)' }
              ]}>
                {mode === 'overview' ? 'Resumen' : mode === 'goals' ? 'Metas' : 'Historial'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Contenido */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'goals' && renderGoals()}
        {viewMode === 'history' && (
          <Animatable.View animation="fadeIn">
            <Card style={styles.comingSoonCard}>
              <Text style={[styles.comingSoonText, { color: theme.colors.text }]}>
                🚧 Historial de ahorros próximamente
              </Text>
            </Card>
          </Animatable.View>
        )}
      </ScrollView>

      {/* FAB para nueva meta o ahorro */}
      <Animatable.View 
        animation="bounceIn" 
        delay={800}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('AddSavings')}
          style={styles.fab}
        >
          <LinearGradient
            colors={Colors.gradients.success}
            style={styles.fabGradient}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  headerTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  headerTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  mainCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    alignItems: 'center',
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    opacity: 0.9,
  },
  mainAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  mainSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  metricsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 8,
    padding: 20,
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 8,
    opacity: 0.9,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
  goalsPreviewCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  goalPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 12,
  },
  goalPreviewRight: {
    alignItems: 'flex-end',
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miniProgressBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  goalsHeader: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
  },
  goalsHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalsHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalsHeaderSubtitle: {
    fontSize: 14,
  },
  goalCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalCardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  goalCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalCardDate: {
    fontSize: 12,
  },
  goalCardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalProgressText: {
    fontSize: 14,
  },
  goalProgressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  completedGoalsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  completedGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  completedGoalEmoji: {
    fontSize: 16,
    marginRight: 12,
  },
  completedGoalInfo: {
    flex: 1,
  },
  completedGoalName: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedGoalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedGoalDate: {
    fontSize: 12,
  },
  comingSoonCard: {
    marginHorizontal: 16,
    marginTop: 40,
    padding: 40,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
