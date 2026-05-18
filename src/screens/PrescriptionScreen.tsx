import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, ChevronLeft, Save, Calendar, Clock, Pill as PillIcon } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function PrescriptionScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medications, setMedications] = useState<any[]>([
    {
      id: Math.random().toString(),
      name: '',
      frequencyType: '1x',
      durationDays: 7,
      doseValue: 1,
      unit: 'comprimé'
    }
  ]);

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: Math.random().toString(),
        name: '',
        frequencyType: '1x',
        durationDays: 7,
        doseValue: 1,
        unit: 'comprimé'
      }
    ]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(m => m.id !== id));
    }
  };

  const updateMedication = (id: string, updates: any) => {
    setMedications(medications.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleSave = async () => {
    if (medications.some(m => !m.name)) {
      Alert.alert(t('common.error'), t('prescription.enterPhone')); // Reusing a translation or should use another
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        title: "Nouvelle Ordonnance",
        startDate: new Date().toISOString().split('T')[0],
        medications: medications.map(m => ({
          ...m,
          times: m.frequencyType === '1x' ? ['08:00'] : m.frequencyType === '2x' ? ['08:00', '20:00'] : ['08:00', '14:00', '20:00']
        })),
        notifConfig: {
          recipients: [user?.phone],
          channels: ['whatsapp']
        }
      };

      await apiClient.post('/prescriptions', payload);
      Alert.alert(t('common.success'), t('prescription.confirmSave'), [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(t('common.error'), t('auth.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('prescription.addPrescTitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {medications.map((med, index) => (
          <View key={med.id} style={styles.medCard}>
            <View style={styles.medHeader}>
              <Text style={styles.medNumber}>Médicament #{index + 1}</Text>
              {medications.length > 1 && (
                <TouchableOpacity onPress={() => removeMedication(med.id)}>
                  <Trash2 color="#ef4444" size={20} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('prescription.medTable')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('prescription.searchMeds')}
                value={med.name}
                onChangeText={(val) => updateMedication(med.id, { name: val })}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('prescription.doseTable')}</Text>
                <TextInput
                  style={styles.input}
                  value={med.doseValue.toString()}
                  onChangeText={(val) => updateMedication(med.id, { doseValue: parseInt(val) || 0 })}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('prescription.durationDays')}</Text>
                <TextInput
                  style={styles.input}
                  value={med.durationDays.toString()}
                  onChangeText={(val) => updateMedication(med.id, { durationDays: parseInt(val) || 0 })}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('prescription.frequency')}</Text>
              <View style={styles.frequencyGrid}>
                {['1x', '2x', '3x'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.freqTab,
                      med.frequencyType === freq && styles.selectedFreqTab
                    ]}
                    onPress={() => updateMedication(med.id, { frequencyType: freq })}
                  >
                    <Text style={[
                      styles.freqLabel,
                      med.frequencyType === freq && styles.selectedFreqLabel
                    ]}>{freq}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addMedBtn} onPress={addMedication}>
          <Plus color="#2563eb" size={20} />
          <Text style={styles.addMedBtnText}>{t('prescription.addMedBtn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.saveButton, isSubmitting && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save color="#fff" size={20} />
              <Text style={styles.saveButtonText}>{t('prescription.save')}</Text>
            </>
          )}
        </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  medCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  medNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  freqTab: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFreqTab: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  freqLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  selectedFreqLabel: {
    color: '#2563eb',
  },
  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 32,
  },
  addMedBtnText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
