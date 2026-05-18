import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  XCircle, 
  Pill,
  RotateCcw
} from 'lucide-react-native';
import { Colors, Spacing, Radius, Typography } from '../utils/Theme';

interface Medicament {
  id: number;
  medicament: string;
  dose: string | number;
  type_frequence: string;
  intervalle_heures: number | null;
  duree_jours: number;
}

interface Ordonnance {
  id: number;
  titre: string;
  nom_patient: string;
  poids_patient: number | null;
  categorie_age: string;
  date_ordonnance: string;
  est_active: boolean;
  nombre_medicaments: number;
  prises_totales: number;
  prises_effectuees: number;
  medicaments?: Medicament[];
}

export default function OrdonnancesScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrdonnances = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get(`/ordonnances?userId=${user.id}`);
      setOrdonnances(res.data.ordonnances || []);
    } catch (error) {
      console.error("Failed to fetch ordonnances:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOrdonnanceDetails = async (id: number) => {
    try {
      const res = await apiClient.get(`/ordonnances/${id}`);
      setOrdonnances(prev => prev.map(o => 
        o.id === id ? { ...o, medicaments: res.data.medicaments } : o
      ));
    } catch (error) {
      console.error("Failed to fetch details:", error);
    }
  };

  useEffect(() => {
    fetchOrdonnances();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrdonnances();
  };

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchOrdonnanceDetails(id);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {ordonnances.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText color={Colors.mutedForeground} size={64} opacity={0.3} />
            <Text style={styles.emptyText}>{t('prescription.noPresc')}</Text>
          </View>
        ) : (
          ordonnances.map(ord => (
            <View key={ord.id} style={styles.card}>
              <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => toggleExpand(ord.id)}
                activeOpacity={0.7}
              >
                <View style={styles.headerInfo}>
                  <Text style={styles.cardTitle}>{ord.titre || "Ordonnance sans titre"}</Text>
                  <Text style={styles.cardSubtitle}>{ord.nom_patient} • {new Date(ord.date_ordonnance).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={styles.headerRight}>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: ord.est_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
                  ]}>
                    <Text style={[styles.statusText, { color: ord.est_active ? Colors.success : Colors.destructive }]}>
                      {ord.est_active ? "Active" : "Terminée"}
                    </Text>
                  </View>
                  {expandedId === ord.id ? <ChevronUp color={Colors.mutedForeground} size={20} /> : <ChevronDown color={Colors.mutedForeground} size={20} />}
                </View>
              </TouchableOpacity>

              <View style={styles.progressSection}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${(ord.prises_effectuees / (ord.prises_totales || 1)) * 100}%`,
                        backgroundColor: ord.est_active ? Colors.primary : Colors.mutedForeground
                      }
                    ]} 
                  />
                </View>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressText}>
                    {ord.prises_effectuees} / {ord.prises_totales} prises
                  </Text>
                  <Text style={styles.progressPercent}>
                    {Math.round((ord.prises_effectuees / (ord.prises_totales || 1)) * 100)}%
                  </Text>
                </View>
              </View>

              {expandedId === ord.id && (
                <View style={styles.expandedContent}>
                  <Text style={styles.sectionLabel}>Médicaments</Text>
                  {ord.medicaments?.map(med => (
                    <View key={med.id} style={styles.medItem}>
                      <View style={styles.medIconBox}>
                        <Pill color={Colors.primary} size={16} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.medName}>{med.medicament}</Text>
                        <Text style={styles.medDetails}>{med.dose} - {med.type_frequence}</Text>
                      </View>
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{med.duree_jours}j</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: Spacing.md,
    color: Colors.mutedForeground,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.foreground,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.mutedForeground,
    fontWeight: '600',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressSection: {
    marginTop: Spacing.lg,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.muted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  progressText: {
    fontSize: 12,
    color: Colors.mutedForeground,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '800',
  },
  expandedContent: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.foreground,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: Radius.lg,
  },
  medIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.foreground,
  },
  medDetails: {
    fontSize: 12,
    color: Colors.mutedForeground,
    fontWeight: '600',
    marginTop: 1,
  },
  durationBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.mutedForeground,
  },
});
