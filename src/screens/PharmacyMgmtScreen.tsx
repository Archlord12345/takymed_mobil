import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Pill,
  ChevronRight
} from 'lucide-react-native';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
  stocks: { medId: number; medName: string; quantity: number }[];
}

export default function PharmacyMgmtScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPharmacies = async () => {
    try {
      const res = await apiClient.get(`/pharmacies?userId=${user?.id}`);
      const pharmaciesWithStock = await Promise.all(res.data.pharmacies.map(async (p: any) => {
        const stockRes = await apiClient.get(`/pharmacies/${p.id}/stock`);
        return { 
          ...p, 
          stocks: stockRes.data.stock.map((s: any) => ({ 
            medId: s.medicationId, 
            medName: s.medicationName, 
            quantity: s.quantity 
          })) 
        };
      }));
      setPharmacies(pharmaciesWithStock);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchPharmacies();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPharmacies();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Supprimer la pharmacie",
      "Voulez-vous vraiment supprimer cet établissement ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => {
          try {
            await apiClient.delete(`/pharmacies/${id}`);
            fetchPharmacies();
          } catch (error) {
            Alert.alert(t('common.error'), "Erreur lors de la suppression");
          }
        }}
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion Pharmacies</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Plus color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {pharmacies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Store color="#cbd5e1" size={64} />
            <Text style={styles.emptyText}>Aucune pharmacie enregistrée.</Text>
          </View>
        ) : (
          pharmacies.map(pharmacy => (
            <View key={pharmacy.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.pharmacyIcon}>
                  <Store color="#2563eb" size={24} />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                  <View style={styles.infoRow}>
                    <MapPin color="#64748b" size={14} />
                    <Text style={styles.infoText}>{pharmacy.address}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(pharmacy.id)}>
                  <Trash2 color="#ef4444" size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.infoRow}>
                  <Phone color="#64748b" size={14} />
                  <Text style={styles.infoText}>{pharmacy.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock color="#64748b" size={14} />
                  <Text style={styles.infoText}>{pharmacy.openTime} - {pharmacy.closeTime}</Text>
                </View>
              </View>

              <View style={styles.stockSection}>
                <View style={styles.stockHeader}>
                  <Text style={styles.stockTitle}>Stocks ({pharmacy.stocks.length})</Text>
                  <TouchableOpacity>
                    <Text style={styles.manageStockText}>Gérer</Text>
                  </TouchableOpacity>
                </View>
                {pharmacy.stocks.slice(0, 3).map((stock, idx) => (
                  <View key={idx} style={styles.stockItem}>
                    <Pill color="#94a3b8" size={14} />
                    <Text style={styles.stockName}>{stock.medName}</Text>
                    <Text style={styles.stockQty}>{stock.quantity} en stock</Text>
                  </View>
                ))}
                {pharmacy.stocks.length > 3 && (
                  <Text style={styles.moreStock}>+ {pharmacy.stocks.length - 3} autres médicaments</Text>
                )}
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
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  addBtn: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pharmacyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
  },
  contactInfo: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  stockSection: {
    marginTop: 16,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  manageStockText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '700',
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stockName: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  stockQty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  moreStock: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
