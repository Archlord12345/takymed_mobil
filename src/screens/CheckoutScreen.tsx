import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  ChevronLeft, 
  Check 
} from 'lucide-react-native';

interface AccountType {
  id: number;
  name: string;
  price: number;
  currency: string;
}

export default function CheckoutScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { planId } = route.params || {};
  
  const [selectedPlan, setSelectedPlan] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await apiClient.get("/admin/settings");
        const plan = res.data.types?.find((t: any) => t.id === planId);
        setSelectedPlan(plan || null);
      } catch (error) {
        console.error("Failed to fetch plan:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [planId]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      Alert.alert(t('common.error'), "Numéro de téléphone invalide");
      return;
    }

    setProcessing(true);
    try {
      await apiClient.post("/payments/send-otp", {
        phoneNumber,
        amount: selectedPlan?.price
      });
      setOtpSent(true);
      Alert.alert(t('common.success'), "Code OTP envoyé par SMS");
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.error || "Erreur lors de l'envoi du code");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!otpCode || otpCode.length < 6) {
      Alert.alert(t('common.error'), "Code OTP invalide");
      return;
    }

    setProcessing(true);
    try {
      await apiClient.post("/payments/process", {
        userId: user?.id,
        planId: selectedPlan?.id,
        phoneNumber,
        otpCode,
        amount: selectedPlan?.price,
        method: "orange_money"
      });
      
      Alert.alert(
        t('common.success'), 
        "Paiement réussi ! Votre compte a été mis à niveau.",
        [{ text: "OK", onPress: () => navigation.navigate('Dashboard') }]
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.error || "Erreur lors du paiement");
    } finally {
      setProcessing(false);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement sécurisé</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.planSummary}>
          <Text style={styles.summaryLabel}>Formule choisie</Text>
          <View style={styles.planRow}>
            <View style={styles.planIcon}>
              <ShieldCheck color="#2563eb" size={24} />
            </View>
            <View>
              <Text style={styles.planName}>{selectedPlan?.name}</Text>
              <Text style={styles.planPrice}>
                {selectedPlan?.price.toLocaleString()} {selectedPlan?.currency || 'FCFA'}/mois
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentMethod}>
          <Text style={styles.sectionTitle}>Méthode de paiement</Text>
          <View style={styles.methodCard}>
            <View style={styles.orangeLogo}>
              <Text style={styles.orangeText}>Orange Money</Text>
            </View>
            <Check color="#22c55e" size={20} />
          </View>
        </View>

        {!otpSent ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro Orange Money</Text>
              <View style={styles.inputWrapper}>
                <Smartphone color="#94a3b8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 690000000"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.primaryBtn, processing && styles.disabledBtn]}
              onPress={handleSendOtp}
              disabled={processing}
            >
              {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Recevoir le code OTP</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Entrez le code OTP</Text>
              <View style={styles.inputWrapper}>
                <Lock color="#94a3b8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Code à 6 chiffres"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="numeric"
                  maxLength={6}
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <Text style={styles.otpHint}>Composez le #150*4*4# pour générer votre code de paiement.</Text>
            </View>
            <TouchableOpacity 
              style={[styles.primaryBtn, processing && styles.disabledBtn]}
              onPress={handlePayment}
              disabled={processing}
            >
              {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Confirmer le paiement</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Changer de numéro</Text>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  planSummary: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
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
  paymentMethod: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  orangeLogo: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orangeText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#0f172a',
  },
  otpHint: {
    fontSize: 12,
    color: '#f97316',
    marginTop: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
});
