import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, Modal, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@clients';

type Client = { id: string; name: string; phone: string; email: string };

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setClients(JSON.parse(data));
    } catch (e) { console.error(e); }
  };

  const addClient = async () => {
    if (!newClientName.trim()) { Alert.alert('خطأ', 'يرجى إدخال اسم العميل'); return; }
    const newClient: Client = {
      id: Date.now().toString(),
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim(),
    };
    const updated = [newClient, ...clients];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setClients(updated);
    setModalVisible(false);
    setNewClientName(''); setNewClientPhone(''); setNewClientEmail('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <Text style={styles.headerTitle}>العملاء</Text>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {clients.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>لا يوجد عملاء مسجلين</Text>
          </View>
        ) : (
          clients.map((client) => (
            <View key={client.id} style={styles.clientCard}>
              <Text style={styles.clientName}>{client.name}</Text>
              {client.phone ? <Text style={styles.clientInfo}>{client.phone}</Text> : null}
              {client.email ? <Text style={styles.clientInfo}>{client.email}</Text> : null}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.createButton, { margin: 16 }]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>عميل جديد</Text>
            <Text style={styles.label}>الاسم</Text>
            <TextInput style={styles.input} placeholder="اسم العميل" placeholderTextColor="#94a3b8" value={newClientName} onChangeText={setNewClientName} textAlign="right" />
            <Text style={[styles.label, { marginTop: 12 }]}>رقم الجوال</Text>
            <TextInput style={styles.input} placeholder="05xxxxxxxx" placeholderTextColor="#94a3b8" value={newClientPhone} onChangeText={setNewClientPhone} keyboardType="phone-pad" textAlign="right" />
            <Text style={[styles.label, { marginTop: 12 }]}>البريد الإلكتروني</Text>
            <TextInput style={styles.input} placeholder="example@email.com" placeholderTextColor="#94a3b8" value={newClientEmail} onChangeText={setNewClientEmail} keyboardType="email-address" textAlign="right" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={addClient}>
                <Text style={styles.modalConfirmText}>إضافة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingTop: 50 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#0f172a', textAlign: 'right', marginBottom: 16 },
  clientCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  clientName: { fontSize: 16, fontWeight: '600', color: '#0f172a', textAlign: 'right' },
  clientInfo: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'right' },
  createButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: '#94a3b8', marginTop: 12, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0f172a', textAlign: 'right' },
  modalButtons: { flexDirection: 'row', marginTop: 20, gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  modalCancelText: { color: '#64748b', fontWeight: '600' },
  modalConfirm: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#2563eb', alignItems: 'center' },
  modalConfirmText: { color: 'white', fontWeight: 'bold' },
});
