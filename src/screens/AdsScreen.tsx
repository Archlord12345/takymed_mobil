import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  Sparkles, 
  Pill, 
  ChevronRight, 
  TrendingUp, 
} from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../utils/Theme';

interface NewMed {
  id: number;
  name: string;
  description: string;
  price: string;
  photoUrl: string;
}

export default function AdsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [newMedications, setNewMedications] = useState<NewMed[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNewMeds = async () => {
    try {
      const res = await apiClient.get("/medications?new=true");
      setNewMedications(res.data.medications || []);
    } catch (err) {
      console.error("Failed to fetch new meds:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNewMeds();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNewMeds();
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
        <View style={styles.header}>
          <View style={styles.promoBadge}>
            <Sparkles color={Colors.primary} size={14} />
            <Text style={styles.promoBadgeText}>Nouveautés du mois</Text>
          </View>
          <Text style={styles.headerSubtitle}>Découvrez les nouveaux produits pharmaceutiques disponibles dans votre réseau.</Text>
        </View>

        <View style={styles.medGrid}>
          {newMedications.map(med => (
            <TouchableOpacity 
              key={med.id} 
              style={styles.medCard}
              onPress={() => navigation.navigate('Search', { q: med.name })}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                {med.photoUrl ? (
                  <Image source={{ uri: med.photoUrl }} style={styles.medImage} resizeMode="contain" />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Pill color={Colors.white} size={48} opacity={0.3} />
                  </View>
                )}
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>Nouveau</Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{med.price || "Sur demande"}</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDesc} numberOfLines={2}>
                  {med.description || "Nouvelle spécialité disponible ce mois-ci."}
                </Text>
                <View style={styles.cardFooter}>
                  <View style={styles.detailsLink}>
                    <Text style={styles.detailsLinkText}>Détails</Text>
                    <ChevronRight color={Colors.primary} size={16} />
                  </View>
                  <TouchableOpacity 
                    style={styles.followBtn}
                    onPress={() => navigation.navigate('AddPrescription', { med: med.name })}
                  >
                    <TrendingUp color={Colors.white} size={16} />
                    <Text style={styles.followBtnText}>Suivre</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {newMedications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune nouveauté à présenter ce mois-ci.</Text>
          </View>
        )}

        {user?.type === "standard" && (
          <TouchableOpacity 
            style={styles.proBanner}
            onPress={() => navigation.navigate('Upgrade')}
            activeOpacity={0.8}
          >
            <View style={styles.proContent}>
              <Text style={styles.proTitle}>Optimisez votre traitement avec TAKYMED Pro</Text>
              <Text style={styles.proDesc}>Rapports détaillés, assistance prioritaire et notifications illimitées.</Text>
              <View style={styles.proBtn}>
                <Text style={styles.proBtnText}>Passer au compte Pro</Text>
                <ChevronRight color={Colors.primary} size={16} />
              </View>
            </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 96, 147, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    gap: 8,
    marginBottom: Spacing.md,
  },
  promoBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
    maxWidth: '80%',
  },
  medGrid: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  medCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  imageContainer: {
    height: 200,
    backgroundColor: Colors.white,
    position: 'relative',
    padding: Spacing.md,
  },
  medImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceTag: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    color: Colors.primary,
    fontWeight: '900',
    fontSize: 14,
  },
  cardInfo: {
    padding: Spacing.lg,
  },
  medName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.foreground,
    letterSpacing: -0.5,
  },
  medDesc: {
    fontSize: 13,
    color: Colors.mutedForeground,
    marginTop: 8,
    lineHeight: 18,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsLinkText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.foreground,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    gap: 8,
  },
  followBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  emptyContainer: {
    padding: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.mutedForeground,
    fontWeight: '600',
    fontSize: 14,
  },
  proBanner: {
    margin: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xxl,
    padding: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  proTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  proDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
    fontWeight: '600',
  },
  proBtn: {
    marginTop: 24,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    gap: 8,
  },
  proBtnText: {
    color: Colors.primary,
    fontWeight: '900',
    fontSize: 14,
  },
});
