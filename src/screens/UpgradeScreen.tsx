import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  Check, 
  ChevronRight, 
  Crown, 
  Shield, 
  Users, 
  ArrowLeftRight 
} from 'lucide-react-native';

interface AccountType {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  maxOrdonnances: number | null;
  maxRappels: number | null;
}

export default function UpgradeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccountTypes() {
      try {
        const res = await apiClient.get("/admin/settings");
        setAccountTypes(res.data.types || []);
      } catch (error) {
        console.error("Failed to fetch account types:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAccountTypes();
  }, []);

  const handleUpgrade = (plan: AccountType) => {
    if (plan.name === "Administrateur") return;
    
    if (plan.name === "Commercial") {
      Alert.alert(
        "Devenir Agent",
        "Voulez-vous envoyer une demande pour devenir agent commercial ?",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Envoyer", onPress: () => submitUpgradeRequest(plan.name) }
        ]
      );
      return;
    }

    if (plan.price > 0) {
      navigation.navigate('Checkout', { planId: plan.id });
    } else {
      submitUpgradeRequest(plan.name);
    }
  };

  const submitUpgradeRequest = async (typeName: string) => {
    try {
      await apiClient.post("/auth/upgrade-request", { requestedType: typeName });
      Alert.alert(t('common.success'), t('upgrade.requestSent'));
    } catch (error) {
      Alert.alert(t('common.error'), t('upgrade.updateError'));
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('upgrade.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('upgrade.unlockPotential')}</Text>
        </View>

        <View style={styles.plansContainer}>
          {accountTypes.map((plan) => (
            <TouchableOpacity 
              key={plan.id} 
              style={[
                styles.planCard,
                user?.type?.toLowerCase() === plan.name.toLowerCase() && styles.currentPlanCard
              ]}
              onPress={() => handleUpgrade(plan)}
            >
              <View style={styles.planHeader}>
                <View style={[
                  styles.iconContainer, 
                  { backgroundColor: plan.name === 'Pro' ? '#fdf2f8' : plan.name === 'Commercial' ? '#fff7ed' : '#f0f9ff' }
                ]}>
                  {plan.name === 'Pro' ? <Crown color="#db2777" size={24} /> : 
                   plan.name === 'Commercial' ? <ArrowLeftRight color="#f97316" size={24} /> : 
                   <Users color="#0284c7" size={24} />}
                </View>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    {plan.price === 0 ? "Gratuit" : `${plan.price.toLocaleString()} ${plan.currency}/mois`}
                  </Text>
                </View>
                {user?.type?.toLowerCase() === plan.name.toLowerCase() && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>{t('upgrade.current')}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.planDesc}>{plan.description}</Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Check color="#22c55e" size={16} />
                  <Text style={styles.featureText}>
                    {plan.maxOrdonnances ? `${plan.maxOrdonnances} ordonnances` : "Ordonnances illimitées"}
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Check color="#22c55e" size={16} />
                  <Text style={styles.featureText}>
                    {plan.maxRappels ? `${plan.maxRappels} rappels` : "Rappels illimités"}
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Check color="#22c55e" size={16} />
                  <Text style={styles.featureText}>Support prioritaire</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.planBtn,
                  user?.type?.toLowerCase() === plan.name.toLowerCase() && styles.disabledBtn
                ]}
                onPress={() => handleUpgrade(plan)}
                disabled={user?.type?.toLowerCase() === plan.name.toLowerCase()}
              >
                <Text style={[
                  styles.planBtnText,
                  user?.type?.toLowerCase() === plan.name.toLowerCase() && styles.disabledBtnText
                ]}>
                  {user?.type?.toLowerCase() === plan.name.toLowerCase() ? "Formule actuelle" : t('upgrade.chooseThis')}
                </Text>
                <ChevronRight color={user?.type?.toLowerCase() === plan.name.toLowerCase() ? "#94a3b8" : "#fff"} size={18} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  plansContainer: {
    padding: 20,
    gap: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currentPlanCard: {
    borderColor: '#2563eb',
    borderWidth: 2,
    backgroundColor: '#f8fafc',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  planPrice: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '700',
    marginTop: 2,
  },
  currentBadge: {
    marginLeft: 'auto',
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  planDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 20,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  planBtn: {
    backgroundColor: '#0f172a',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBtn: {
    backgroundColor: '#f1f5f9',
  },
  planBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtnText: {
    color: '#94a3b8',
  },
});
