import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Store } from 'lucide-react-native';
import apiClient from '../api/client';
import { Colors, Spacing, Radius } from '../utils/Theme';

export default function SearchScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Permission handling in CLI usually requires a dedicated library like react-native-permissions
  // For now, we focus on the UI/UX mirror as requested.

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/medications?q=${encodeURIComponent(query)}`);
      setResults(res.data.pharmacies || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={styles.pharmacyIcon}>
          <Store color={Colors.primary} size={24} />
        </View>
        <View style={styles.pharmacyInfo}>
          <Text style={styles.pharmacyName}>{item.name}</Text>
          <View style={styles.addressRow}>
            <MapPin color={Colors.mutedForeground} size={14} />
            <Text style={styles.pharmacyAddress}>{item.address}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.stockInfo}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.available ? Colors.success : Colors.destructive }
          ]}>
            {item.available ? t('search.available') : t('search.unavailable')}
          </Text>
        </View>
        <Text style={styles.distance}>1.2 km</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Search color={Colors.mutedForeground} size={20} />
          <TextInput
            style={styles.input}
            placeholder={t('search.searchPlaceholder')}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor={Colors.mutedForeground}
          />
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>{t('search.searchBtn')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading && query ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('search.noResults')}</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.muted,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    height: 52,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.foreground,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  searchBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  listContent: {
    padding: Spacing.md,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pharmacyIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(0, 96, 147, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.foreground,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  pharmacyAddress: {
    fontSize: 12,
    color: Colors.mutedForeground,
    fontWeight: '600',
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.muted,
    paddingTop: 16,
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
  },
  distance: {
    fontSize: 12,
    color: Colors.mutedForeground,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.mutedForeground,
    fontWeight: '600',
    textAlign: 'center',
  },
});
