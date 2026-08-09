import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const STORAGE_KEY = '@invoices';

type Invoice = {
  id: string; number: string; client: string; amount: number;
  status: 'paid' | 'pending' | 'overdue'; date: string;
  items: { name: string; qty: number; price: number }[]; tax: number;
};

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const invoices: Invoice[] = JSON.parse(data);
        const found = invoices.find(i => i.id === id);
        if (found) setInvoice(found);
      }
    } catch (e) { console.error(e); }
  };

  if (!invoice) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#94a3b8' }}>جاري التحميل...</Text>
      </View>
    );
  }

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

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxAmount = subtotal * (invoice.tax / 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <View style={styles.detailHeader}>
        <Text style={styles.detailNumber}>{invoice.number}</Text>
        <View style={[styles.detailStatus, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
          <Text style={[styles.detailStatusText, { color: getStatusColor(invoice.status) }]}>{getStatusLabel(invoice.status)}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{invoice.client}</Text>
          <Text style={styles.detailLabel}>العميل</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{invoice.date}</Text>
          <Text style={styles.detailLabel}>التاريخ</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginHorizontal: 16 }]}>المنتجات</Text>
      
      {invoice.items.map((item, index) => (
        <View key={index} style={styles.formCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailValue}>{item.name}</Text>
            <Text style={styles.detailLabel}>الوصف</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailValue}>{item.qty} × {item.price.toLocaleString()} ر.س</Text>
            <Text style={styles.detailLabel}>الكمية × السعر</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailValue, { fontWeight: 'bold' }]}>{(item.qty * item.price).toLocaleString()} ر.س</Text>
            <Text style={styles.detailLabel}>المجموع</Text>
          </View>
        </View>
      ))}

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>{subtotal.toLocaleString()} ر.س</Text>
          <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>{taxAmount.toLocaleString()} ر.س</Text>
          <Text style={styles.summaryLabel}>الضريبة ({invoice.tax}%)</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalValue}>{invoice.amount.toLocaleString()} ر.س</Text>
          <Text style={styles.totalLabel}>الإجمالي</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingTop: 50 },
  detailHeader: { alignItems: 'center', marginBottom: 20 },
  detailNumber: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  detailStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
  detailStatusText: { fontSize: 14, fontWeight: '600' },
  formCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  detailLabel: { color: '#64748b', fontSize: 14 },
  detailValue: { color: '#0f172a', fontSize: 14, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', textAlign: 'right', marginBottom: 12 },
  summaryCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { color: '#64748b', fontSize: 14 },
  summaryValue: { color: '#0f172a', fontSize: 14, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 8, paddingTop: 12 },
  totalLabel: { color: '#0f172a', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#2563eb', fontSize: 18, fontWeight: 'bold' },
});
            
