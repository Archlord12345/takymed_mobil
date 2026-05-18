import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  UserPlus, 
  CheckCircle, 
  Users, 
  Plus, 
  Phone, 
  ClipboardList, 
  Calendar,
  MessageCircle,
  Loader2
} from 'lucide-react-native';

interface Client {
  id: number;
  phone: string;
  name: string;
  isValid: boolean;
  createdAt: string;
  prescriptionCount: number;
  reminderCount: number;
}

export default function CommercialDashboardScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClients = async () => {
    if (!user?.id) return;
    try {
      const res = await apiClient.get(`/commercial/clients?commercialId=${user.id}`);
      setClients(res.data.clients || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Bonjour ${name}, je suis votre conseiller TAKYMED. Je vous contacte pour votre suivi de traitement.`;
    const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Erreur", "WhatsApp n'est pas installé sur cet appareil");
      }
    });
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Espace Commercial</Text>
          <Text style={styles.headerSubtitle}>Suivi et validation clients</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('CommercialRegister')}
        >
          <UserPlus color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Users color="#2563eb" size={20} />
            <Text style={styles.statValue}>{clients.length}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle color="#16a34a" size={20} />
            <Text style={styles.statValue}>{clients.filter(c => c.isValid).length}</Text>
            <Text style={styles.statLabel}>Validés</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mes Clients Enregistrés</Text>

        {clients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users color="#cbd5e1" size={64} />
            <Text style={styles.emptyText}>Aucun client trouvé.</Text>
            <TouchableOpacity 
              style={styles.registerLink}
              onPress={() => navigation.navigate('CommercialRegister')}
            >
              <Text style={styles.registerLinkText}>Inscrire un client maintenant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          clients.map(client => (
            <View key={client.id} style={styles.clientCard}>
              <View style={styles.clientHeader}>
                <View style={[styles.clientStatus, { backgroundColor: client.isValid ? '#f0fdf4' : '#fff7ed' }]}>
                  {client.isValid ? <CheckCircle color="#16a34a" size={18} /> : <Loader2 color="#f97316" size={18} />}
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientPhone}>{client.phone}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.waBtn}
                  onPress={() => handleWhatsApp(client.phone, client.name)}
                >
                  <MessageCircle color="#fff" size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.clientFooter}>
                <View style={styles.clientStats}>
                  <View style={styles.miniStat}>
                    <ClipboardList color="#64748b" size={12} />
                    <Text style={styles.miniStatText}>{client.prescriptionCount} ordonnances</Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Calendar color="#64748b" size={12} />
                    <Text style={styles.miniStatText}>{client.reminderCount} rappels</Text>
                  </View>
                </View>
                <Text style={styles.dateText}>Depuis le {new Date(client.createdAt).toLocaleDateString('fr-FR')}</Text>
              </View>
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
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContent: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  registerLink: {
    marginTop: 12,
  },
  registerLinkText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  clientCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientStatus: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  clientPhone: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  waBtn: {
    backgroundColor: '#22c55e',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientStats: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniStatText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  dateText: {
    fontSize: 10,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
