import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ShieldCheck, Clock, Package, Zap } from 'lucide-react-native';
import Logo from '../components/Logo';

export default function WelcomeScreen({ navigation }: any) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Logo size={150} />
          <View style={[styles.badge, { marginTop: 24 }]}>
            <Text style={styles.badgeText}>{t('index.badge')}</Text>
          </View>
          <Text style={styles.heroSubtitle}>{t('index.heroSubtitle')}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.primaryButtonText}>{t('index.startFree')}</Text>
            <ChevronRight color="#fff" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>{t('index.signIn')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>{t('index.featuresTitle')}</Text>
          
          <View style={styles.featureItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#eef2ff' }]}>
              <Clock color="#4f46e5" size={24} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('index.feature1Title')}</Text>
              <Text style={styles.featureDesc}>{t('index.feature1Desc')}</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Package color="#22c55e" size={24} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('index.feature2Title')}</Text>
              <Text style={styles.featureDesc}>{t('index.feature2Desc')}</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#fff7ed' }]}>
              <Zap color="#f97316" size={24} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('index.feature3Title')}</Text>
              <Text style={styles.featureDesc}>{t('index.feature3Desc')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
  },
  hero: {
    marginTop: 40,
    alignItems: 'center',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 40,
  },
  brand: {
    color: '#2563eb',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  actions: {
    marginTop: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    marginTop: 60,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  featureDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});
