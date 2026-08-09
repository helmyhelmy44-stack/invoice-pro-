import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const STORAGE_KEY = '@invoices';

type Invoice = {
  id: string; number: string; client: string; amount: number;
  status: 'paid' | 'pending' | 'overdue'; date: string;
  items: { name: string; qty: number; price: number }[]; tax: number;
};

export default function CreateInvoiceScreen() {
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending' | 'overdue'>('pending');
  const [items, setItems] = useState([{ name: '', qty: 1, price: 0 }]);
  const [tax, setTax] = useState('15');
  const router = useRouter();

  const addItem = () => setItems([...items, { name: '', qty: 1, price: 0 }]);
  
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = field === 'name' ? value : Number(value);
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxAmount = subtotal * (Number(tax) / 100);
  const total = subtotal + taxAmount;

  const saveInvoice = async () => {
    if (!client.trim()) { Alert.alert('خطأ', 'يرجى إدخال اسم العميل'); return; }
    if (items.some(i => !i.name.trim())) { Alert.alert('خطأ', 'يرجى إدخال اسم لكل منتج/خدمة'); return; }

    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const invoices: Invoice[] = existing ? JSON.parse(existing) : [];
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        number: `#INV-${String(invoices.length + 1).padStart(3, '0')}`,
        client: client.trim(), amount: total, status,
        date: new Date().toLocaleDateString('ar-SA'),
        items: items.map(i => ({ ...i })), tax: Number(tax),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newInvoice, ...invoices]));
      Alert.alert('تم', 'تم حفظ الفاتورة بنجاح', [{ text: 'حسناً', onPress: () => router.back() }]);
    } catch (e) { Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ'); }
  };

  const statusOptions = [
    { key: 'paid', label: 'مدفوعة', color: '#16a34a' },
    { key: 'pending', label: 'مستحقة', color: '#d97706' },
    { key: 'overdue', label: 'متأخرة', color: '#dc2626' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <Text style={styles.headerTitle}>فاتورة جديدة</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>اسم العميل</Text>
        <TextInput style={styles.input} placeholder="مثال: شركة النور للتجارة" placeholderTextColor="#94a3b8" value={client} onChangeText={setClient} textAlign="right" />

        <Text style={[styles.label, { marginTop: 16 }]}>حالة الفاتورة</Text>
        <View style={styles.statusRow}>
          {statusOptions.map(opt => (
            <TouchableOpacity key={opt.key} style={[styles.statusOption, status === opt.key && { borderColor: opt.color, backgroundColor: opt.color + '15' }]} onPress={() => setStatus(opt.key as any)}>
              <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
              <Text style={[styles.statusOptionText, status === opt.key && { color: opt.color }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>نسبة الضريبة (%)</Text>
        <TextInput style={styles.input} value={tax} onChangeText={setTax} keyboardType="numeric" textAlign="right" />
      </View>

      <Text style={[styles.sectionTitle, { marginHorizontal: 16 }]}>المنتجات / الخدمات</Text>
      
      {items.map((item, index) => (
        <View key={index} style={styles.formCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemNumber}>المنتج {index + 1}</Text>
            {items.length > 1 && (
              <TouchableOpacity onPress={() => removeItem(index)}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.label}>الوصف</Text>
          <TextInput style={styles.input} placeholder="اسم المنتج أو الخدمة" placeholderTextColor="#94a3b8" value={item.name} onChangeText={(text) => updateItem(index, 'name', text)} textAlign="right" />
          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>الكمية</Text>
              <TextInput style={styles.input} value={String(item.qty)} onChangeText={(text) => updateItem(index, 'qty', text)} keyboardType="numeric" textAlign="right" />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>السعر (ر.س)</Text>
              <TextInput style={styles.input} value={String(item.price)} onChangeText={(text) => updateItem(index, 'price', text)} keyboardType="numeric" textAlign="right" />
            </View>
          </View>
          <Text style={styles.itemTotal}>المجموع: {(item.qty * item.price).toLocaleString()} ر.س</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
        <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
        <Text style={styles.addItemText}>إضافة منتج آخر</Text>
      </TouchableOpacity>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>{subtotal.toLocaleString()} ر.س</Text>
          <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>{taxAmount.toLocaleString()} ر.س</Text>
          <Text style={styles.summaryLabel}>الضريبة ({tax}%)</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalValue}>{total.toLocaleString()} ر.س</Text>
          <Text style={styles.totalLabel}>الإجمالي</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveInvoice}>
        <Ionicons name="save-outline" size={22} color="white" />
        <Text style={styles.saveButtonText}>حفظ الفاتورة</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingTop: 50 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#0f172a', textAlign: 'right', marginBottom: 16 },
  formCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0f172a', textAlign: 'right' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0', marginHorizontal: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 6 },
  statusOptionText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', textAlign: 'right', marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemNumber: { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },
  rowInputs: { flexDirection: 'row', marginTop: 8 },
  itemTotal: { textAlign: 'right', marginTop: 8, color: '#2563eb', fontWeight: '600', fontSize: 14 },
  addItemButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginBottom: 16 },
  addItemText: { color: '#2563eb', marginLeft: 6, fontSize: 14, fontWeight: '600' },
  summaryCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { color: '#64748b', fontSize: 14 },
  summaryValue: { color: '#0f172a', fontSize: 14, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 8, paddingTop: 12 },
  totalLabel: { color: '#0f172a', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#2563eb', fontSize: 18, fontWeight: 'bold' },
  saveButton: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
      
