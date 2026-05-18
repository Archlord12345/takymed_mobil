import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  Bell, 
  PlusCircle, 
  Search, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../utils/Theme';

export default function DashboardScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [doses, setDoses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    try {
      const res = await apiClient.get(`/prescriptions?userId=${user.id}`);
      setDoses(res.data.doses || []);
      setStats(res.data.stats || null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('dashboard.hello')},</Text>
            <Text style={styles.userName}>{user?.name || user?.phone}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell color={Colors.foreground} size={24} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#eef2ff' }]}>
              <Activity color={Colors.primary} size={20} />
            </View>
            <Text style={styles.statValue}>{stats?.observanceRate || 0}%</Text>
            <Text style={styles.statLabel}>{t('dashboard.adherence')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
              <CheckCircle2 color={Colors.secondary} size={20} />
            </View>
            <Text style={styles.statValue}>{stats?.activeReminders || 0}</Text>
            <Text style={styles.statLabel}>{t('dashboard.toTake')}</Text>
          </View>
        </View>

        {/* Next Dose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dashboard.nextDose')}</Text>
          {doses.length > 0 ? (
            <View style={styles.nextDoseCard}>
              <View style={styles.nextDoseInfo}>
                <Clock color={Colors.primary} size={24} />
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{doses[0].medicationName}</Text>
                  <Text style={styles.medTime}>{doses[0].time} - {doses[0].dose} {doses[0].unit}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.takeBtn}>
                <Text style={styles.takeBtnText}>{t('dashboard.markTaken')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('dashboard.noUpcoming')}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('AddPrescription')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fdf2f8' }]}>
              <PlusCircle color="#db2777" size={24} />
            </View>
            <Text style={styles.actionLabel}>{t('dashboard.newPrescription')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Search')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
              <Search color={Colors.primary} size={24} />
            </View>
            <Text style={styles.actionLabel}>{t('dashboard.medication')}</Text>
          </TouchableOpacity>
        </View>

        {user?.type === 'standard' && (
          <TouchableOpacity 
            style={styles.upgradeBanner}
            onPress={() => navigation.navigate('Upgrade')}
          >
            <View style={styles.upgradeIcon}>
              <TrendingUp color={Colors.white} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeTitle}>Passer à la formule Pro</Text>
              <Text style={styles.upgradeDesc}>Débloquez toutes les fonctionnalités de suivi.</Text>
            </View>
            <ChevronRight color={Colors.white} size={20} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  greeting: {
    fontSize: 14,
    color: Colors.mutedForeground,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.foreground,
    letterSpacing: -0.5,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.destructive,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.foreground,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.mutedForeground,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.foreground,
    marginBottom: Spacing.md,
  },
  nextDoseCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  nextDoseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.foreground,
  },
  medTime: {
    fontSize: 14,
    color: Colors.mutedForeground,
    fontWeight: '600',
    marginTop: 2,
  },
  takeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  takeBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: Colors.muted,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.mutedForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.foreground,
    textAlign: 'center',
  },
  upgradeBanner: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.foreground,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  upgradeIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  upgradeDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
