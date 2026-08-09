import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

const STORAGE_KEY = '@invoices';

type Invoice = {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  items: { name: string; qty: number; price: number }[];
  tax: number;
};

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadInvoices();
    }, [])
  );

  const loadInvoices = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setInvoices(JSON.parse(data));
    } catch (e) { console.error(e); }
  };

  const deleteInvoice = async (id: string) => {
    Alert.alert('حذف الفاتورة', 'هل أنت متأكد من حذف هذه الفاتورة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          const updated = invoices.filter(i => i.id !== id);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          setInvoices(updated);
        }
      }
    ]);
  };

  const filtered = invoices.filter(inv => {
    const matchesFilter = filter === 'all' || inv.status === filter;
    const matchesSearch = inv.client.includes(search) || inv.number.includes(search);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#16a34a';
      case 'pending': return '#d97706';
      case 'overdue': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوعة';
      case 'pending': return 'مستحقة';
      case 'overdue': return 'متأخرة';
      default: return status;
    }
  };

  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'paid', label: 'مدفوعة' },
    { key: 'pending', label: 'مستحقة' },
    { key: 'overdue', label: 'متأخرة' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <Text style={styles.headerTitle}>الفواتير</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="بحث باسم العميل أو رقم الفاتورة..."
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
        textAlign="right"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>لا توجد نتائج</Text>
          </View>
        ) : (
          filtered.map((invoice) => (
            <TouchableOpacity 
              key={invoice.id} 
              style={styles.invoiceCard}
              onPress={() => router.push(`/invoice/${invoice.id}`)}
              onLongPress={() => deleteInvoice(invoice.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.invoiceNumber}>{invoice.number}</Text>
                <Text style={styles.clientName}>{invoice.client}</Text>
                <Text style={styles.invoiceDate}>{invoice.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amount}>{invoice.amount.toLocaleString()} ر.س</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
                  <Text style={[styles.status, { color: getStatusColor(invoice.status) }]}>{getStatusLabel(invoice.status)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.createButton, { margin: 16 }]} onPress={() => router.push('/create-invoice')}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingTop: 50 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#0f172a', textAlign: 'right', marginBottom: 16 },
  searchInput: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0f172a', marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  filterContainer: { marginBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', marginLeft: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: 'white' },
  invoiceCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  invoiceNumber: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', textAlign: 'right' },
  clientName: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'right' },
  invoiceDate: { fontSize: 12, color: '#94a3b8', marginTop: 4, textAlign: 'right' },
  amount: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  status: { fontSize: 12, fontWeight: '600' },
  createButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: '#94a3b8', marginTop: 12, fontSize: 15 },
});
      
