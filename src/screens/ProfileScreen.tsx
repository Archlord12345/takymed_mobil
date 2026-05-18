import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, ChevronRight, Settings, Shield, Bell, Store, Crown } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../utils/Theme';

export default function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const isPro = user?.type === 'professional' || user?.type === 'pharmacist' || user?.type === 'admin';

  const menuItems = [
    { icon: <Settings color={Colors.mutedForeground} size={22} />, label: t('profile.title'), color: Colors.muted, onPress: () => {} },
    ...(user?.type === 'standard' ? [{ icon: <Crown color="#db2777" size={22} />, label: 'Passer au Pro', color: '#fdf2f8', onPress: () => navigation.navigate('Upgrade') }] : []),
    ...(isPro ? [{ icon: <Store color={Colors.primary} size={22} />, label: 'Gérer mes Pharmacies', color: 'rgba(0, 96, 147, 0.05)', onPress: () => navigation.navigate('PharmacyMgmt') }] : []),
    { icon: <Shield color={Colors.mutedForeground} size={22} />, label: t('footer.privacy'), color: Colors.muted, onPress: () => {} },
    { icon: <Bell color={Colors.mutedForeground} size={22} />, label: t('dashboard.reminders'), color: Colors.muted, onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User color={Colors.primary} size={44} />
            </View>
            <TouchableOpacity style={styles.editAvatar}>
              <Settings color={Colors.white} size={14} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.userPhone}>{user?.phone || 'Pas de numéro'}</Text>
          <View style={[styles.badge, { backgroundColor: isPro ? 'rgba(0, 168, 89, 0.1)' : 'rgba(0, 96, 147, 0.1)' }]}>
            <Text style={[styles.badgeText, { color: isPro ? Colors.secondary : Colors.primary }]}>
              {user?.type || 'Standard'}
            </Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.6}>
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                {item.icon}
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight color={Colors.border} size={20} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <LogOut color={Colors.destructive} size={22} />
          <Text style={styles.logoutText}>{t('nav.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0 (Build 1)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.background,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  editAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.foreground,
    letterSpacing: -0.5,
  },
  userPhone: {
    fontSize: 14,
    color: Colors.mutedForeground,
    fontWeight: '600',
    marginTop: 4,
  },
  badge: {
    marginTop: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuSection: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.foreground,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingVertical: 18,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    color: Colors.destructive,
    fontSize: 16,
    fontWeight: '800',
  },
  version: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: 11,
    color: Colors.mutedForeground,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
