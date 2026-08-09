import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar 
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

export default function DashboardScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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

  const totalSales = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const recentInvoices = [...invoices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة التحكم</Text>
        <Text style={styles.headerSubtitle}>مرحباً بك في Invoice Pro</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#2563eb' }]}>
          <Ionicons name="cash-outline" size={26} color="white" />
          <Text style={styles.statValue}>{totalSales.toLocaleString()}</Text>
          <Text style={styles.statLabel}>إجمالي المبيعات</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#16a34a' }]}>
          <Ionicons name="checkmark-circle-outline" size={26} color="white" />
          <Text style={styles.statValue}>{paidCount}</Text>
          <Text style={styles.statLabel}>فواتير مدفوعة</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#d97706' }]}>
          <Ionicons name="time-outline" size={26} color="white" />
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>فواتير مستحقة</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#dc2626' }]}>
          <Ionicons name="alert-circle-outline" size={26} color="white" />
          <Text style={styles.statValue}>{overdueCount}</Text>
          <Text style={styles.statLabel}>فواتير متأخرة</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>آخر الفواتير</Text>
          <TouchableOpacity onPress={() => router.push('/invoices')}>
            <Text style={styles.seeAll}>عرض الكل</Text>
          </TouchableOpacity>
        </View>

        {recentInvoices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>لا توجد فواتير بعد</Text>
          </View>
        ) : (
          recentInvoices.map((invoice) => (
            <TouchableOpacity 
              key={invoice.id} 
              style={styles.invoiceCard}
              onPress={() => router.push(`/invoice/${invoice.id}`)}
            >
              <View>
                <Text style={styles.invoiceNumber}>{invoice.number}</Text>
                <Text style={styles.clientName}>{invoice.client}</Text>
                <Text style={styles.invoiceDate}>{invoice.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amount}>{invoice.amount.toLocaleString()} ر.س</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
                  <Text style={[styles.status, { color: getStatusColor(invoice.status) }]}>
                    {getStatusLabel(invoice.status)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => router.push('/create-invoice')}
      >
        <Ionicons name="add-circle-outline" size={22} color="white" />
        <Text style={styles.createButtonText}>إنشاء فاتورة جديدة</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingTop: 50 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#0f172a', textAlign: 'right' },
  headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4, textAlign: 'right' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { width: '48%', borderRadius: 14, padding: 16, marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 10, textAlign: 'right' },
  statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, textAlign: 'right' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', textAlign: 'right' },
  seeAll: { color: '#2563eb', fontSize: 14, fontWeight: '600' },
  invoiceCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  invoiceNumber: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', textAlign: 'right' },
  clientName: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'right' },
  invoiceDate: { fontSize: 12, color: '#94a3b8', marginTop: 4, textAlign: 'right' },
  amount: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  status: { fontSize: 12, fontWeight: '600' },
  createButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  createButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: '#94a3b8', marginTop: 12, fontSize: 15 },
});
        
