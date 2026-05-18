import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  UserPlus, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Phone, 
  User, 
  Pill,
  CheckCircle2
} from 'lucide-react-native';

export default function CommercialRegisterScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
  });

  const [medications, setMedications] = useState<any[]>([
    { id: '1', name: '', dose: 1, duration: 7, frequency: '1x' }
  ]);

  const handleRegisterClient = async () => {
    if (!clientInfo.name || !clientInfo.phone) {
      Alert.alert("Erreur", "Veuillez remplir les informations du client");
      return;
    }
    setStep(2);
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      // 1. Register Client
      const regRes = await apiClient.post("/commercial/register-client", {
        name: clientInfo.name,
        phone: clientInfo.phone,
        commercialId: user?.id
      });
      
      const clientId = regRes.data.clientId;

      // 2. Add Prescription
      await apiClient.post("/prescriptions", {
        userId: clientId,
        title: "Ordonnance Initiale",
        startDate: new Date().toISOString().split('T')[0],
        medications: medications.map(m => ({
          name: m.name,
          doseValue: m.dose,
          durationDays: m.duration,
          frequencyType: m.frequency,
          times: ['08:00'], // Simple default
          unit: 'comprimé'
        })),
        notifConfig: {
          recipients: [clientInfo.phone],
          channels: ['whatsapp']
        }
      });

      Alert.alert(
        "Succès", 
        "Client et ordonnance enregistrés avec succès !",
        [{ text: "OK", onPress: () => navigation.navigate('CommercialDashboard') }]
      );
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)}>
          <ChevronLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvel Enregistrement</Text>
      </View>

      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step >= 1 && styles.activeStepDot]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, step >= 2 && styles.activeStepDot]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 ? (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Informations Client</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <View style={styles.inputWrapper}>
                <User color="#94a3b8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Jean Dupont"
                  value={clientInfo.name}
                  onChangeText={(val) => setClientInfo({ ...clientInfo, name: val })}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <View style={styles.inputWrapper}>
                <Phone color="#94a3b8" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 690000000"
                  value={clientInfo.phone}
                  onChangeText={(val) => setClientInfo({ ...clientInfo, phone: val })}
                  keyboardType="phone-pad"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={handleRegisterClient}>
              <Text style={styles.nextBtnText}>Étape suivante</Text>
              <ChevronRight color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Prescription</Text>
            {medications.map((med, idx) => (
              <View key={idx} style={styles.medCard}>
                <Text style={styles.medLabel}>Médicament {idx + 1}</Text>
                <TextInput
                  style={styles.medInput}
                  placeholder="Nom du médicament"
                  value={med.name}
                  onChangeText={(val) => {
                    const newMeds = [...medications];
                    newMeds[idx].name = val;
                    setMedications(newMeds);
                  }}
                  placeholderTextColor="#94a3b8"
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.medInput, { flex: 1 }]}
                    placeholder="Dose"
                    keyboardType="numeric"
                    value={med.dose.toString()}
                    onChangeText={(val) => {
                      const newMeds = [...medications];
                      newMeds[idx].dose = val;
                      setMedications(newMeds);
                    }}
                    placeholderTextColor="#94a3b8"
                  />
                  <TextInput
                    style={[styles.medInput, { flex: 1 }]}
                    placeholder="Jours"
                    keyboardType="numeric"
                    value={med.duration.toString()}
                    onChangeText={(val) => {
                      const newMeds = [...medications];
                      newMeds[idx].duration = val;
                      setMedications(newMeds);
                    }}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity 
              style={[styles.finalizeBtn, loading && styles.disabledBtn]} 
              onPress={handleFinalize}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Save color="#fff" size={20} />
                  <Text style={styles.finalizeBtnText}>Finaliser l'inscription</Text>
                </>
              )}
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  activeStepDot: {
    backgroundColor: '#2563eb',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
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
  nextBtn: {
    backgroundColor: '#0f172a',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  medCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  medLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  medInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  finalizeBtn: {
    backgroundColor: '#2563eb',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  finalizeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.7,
  },
});
