
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, TextInput, FlatList, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loadStrings = async (lang) => {
  try {
    const strings = lang === 'hi' ? require('./i18n/hi.json') : require('./i18n/en.json');
    return strings;
  } catch (e) {
    return require('./i18n/en.json');
  }
};

const Button = ({ title, onPress, style }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[{ padding: 14, borderRadius: 16, backgroundColor: '#1e293b', margin: 6 }, style]}
  >
    <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>{title}</Text>
  </TouchableOpacity>
);

const Card = ({ children, style }) => (
  <View style={[{ backgroundColor: 'white', borderRadius: 20, padding: 16, marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }, style]}>
    {children}
  </View>
);

export default function App() {
  const [lang, setLang] = useState('en');
  const [t, setT] = useState(require('./i18n/en.json'));
  const [tab, setTab] = useState('home');
  const [entries, setEntries] = useState([]);
  const [parties, setParties] = useState([]);
  const [form, setForm] = useState({ type:'debit', role:'customer', amount:'', note:'', party:'', partyMobile:'', date: new Date().toISOString().slice(0,10) });
  const [newParty, setNewParty] = useState('');
  const [newMobile, setNewMobile] = useState('');

  useEffect(() => {
    (async () => {
      try{
        const e = await AsyncStorage.getItem('entries');
        const p = await AsyncStorage.getItem('parties');
        if(e) setEntries(JSON.parse(e));
        if(p) setParties(JSON.parse(p));
      } catch(err){}
    })();
  }, []);

  useEffect(() => { AsyncStorage.setItem('entries', JSON.stringify(entries || [])); }, [entries]);
  useEffect(() => { AsyncStorage.setItem('parties', JSON.stringify(parties || [])); }, [parties]);

  useEffect(() => {
    loadStrings(lang).then(setT);
  }, [lang]);

  const totals = useMemo(() => {
    let debit = 0, credit = 0;
    for(const e of entries){
      if(e.type === 'debit') debit += Number(e.amount || 0);
      else credit += Number(e.amount || 0);
    }
    return { debit, credit, balance: debit - credit };
  }, [entries]);

  const addEntry = () => {
    if(!form.party){ Alert.alert(t.selectParty); return; }
    if(!form.amount){ Alert.alert(t.amount + ' ?'); return; }
    const entry = { id: Date.now().toString(), ...form, amount: Number(form.amount) };
    setEntries([entry, ...entries]);
    setForm({ ...form, amount:'', note:'' });
    if(Platform.OS !== 'web') Alert.alert(t.entrySaved);
  };

  const addParty = () => {
    const name = newParty.trim();
    const mobile = newMobile.trim();
    if(!name) return;
    if(parties.find(p => p.name.toLowerCase() === name.toLowerCase())) return;
    setParties([{ id: Date.now().toString(), name, mobile }, ...parties]);
    setNewParty('');
    setNewMobile('');
  };

  const Header = () => (
    <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
      <Text style={{ fontSize: 24, fontWeight:'700' }}>{t.appTitle}</Text>
      <View style={{ flexDirection:'row' }}>
        <Button title={t.language + ': ' + (lang==='en'?'EN':'हिं')} onPress={() => setLang(lang === 'en' ? 'hi' : 'en')} />
      </View>
    </View>
  );

  const Nav = () => (
    <View style={{ flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' }}>
      <Button title={t.home} onPress={() => setTab('home')} style={{ flex:1 }} />
      <Button title={t.addEntry} onPress={() => setTab('add')} style={{ flex:1 }} />
      <Button title={t.ledger} onPress={() => setTab('ledger')} style={{ flex:1 }} />
      <Button title={t.parties} onPress={() => setTab('parties')} style={{ flex:1 }} />
      <Button title={t.reports} onPress={() => setTab('reports')} style={{ flex:1 }} />
    </View>
  );

  const Home = () => (
    <Card>
      <Text style={{ fontSize:18, marginBottom:8 }}>{t.totalDebit}: {totals.debit}</Text>
      <Text style={{ fontSize:18, marginBottom:8 }}>{t.totalCredit}: {totals.credit}</Text>
      <Text style={{ fontSize:22, fontWeight:'700' }}>{t.balance}: {totals.balance}</Text>
    </Card>
  );

  const AddEntry = () => (
    <Card>
      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
        <Button title={t.debit} onPress={() => setForm({ ...form, type:'debit' })} style={{ backgroundColor: form.type==='debit' ? '#0f766e' : '#334155', flex:1 }} />
        <Button title={t.credit} onPress={() => setForm({ ...form, type:'credit' })} style={{ backgroundColor: form.type==='credit' ? '#0f766e' : '#334155', flex:1 }} />
      </View>
      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
        <Button title={t.customer} onPress={() => setForm({ ...form, role:'customer' })} style={{ backgroundColor: form.role==='customer' ? '#0f766e' : '#334155', flex:1 }} />
        <Button title={t.seller} onPress={() => setForm({ ...form, role:'seller' })} style={{ backgroundColor: form.role==='seller' ? '#0f766e' : '#334155', flex:1 }} />
      </View>

      <Text style={{ marginTop:10 }}>{t.selectParty}</Text>
      <FlatList
        horizontal
        data={parties}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => setForm({ ...form, party: item.name, partyMobile: item.mobile })} style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:20, margin:6, backgroundColor: form.party===item.name ? '#0ea5e9' : '#e5e7eb' }}>
            <Text style={{ fontSize:16 }}>{item.name} ({item.mobile})</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color:'#6b7280' }}>{t.noEntries}</Text>}
        showsHorizontalScrollIndicator={false}
      />

      <TextInput placeholder={t.amount} keyboardType="numeric" value={String(form.amount)} onChangeText={(v)=>setForm({ ...form, amount:v })} style={{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12, marginVertical:6, fontSize:18 }} />
      <TextInput placeholder={t.note} value={form.note} onChangeText={(v)=>setForm({ ...form, note:v })} style={{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12, marginVertical:6, fontSize:18 }} />
      <TextInput placeholder={t.date} value={form.date} onChangeText={(v)=>setForm({ ...form, date:v })} style={{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12, marginVertical:6, fontSize:18 }} />
      <Button title={t.save} onPress={addEntry} style={{ backgroundColor:'#16a34a' }} />
    </Card>
  );

  const Ledger = () => (
    <Card>
      <View style={{ flexDirection:'row', borderBottomWidth:1, borderColor:'#cbd5e1', paddingBottom:6, marginBottom:6 }}>
        <Text style={{ flex:2, fontWeight:'700' }}>{t.partyName}</Text>
        <Text style={{ flex:1, fontWeight:'700', textAlign:'right' }}>{t.debit}</Text>
        <Text style={{ flex:1, fontWeight:'700', textAlign:'right' }}>{t.credit}</Text>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item)=>item.id}
        ListEmptyComponent={<Text style={{ color:'#6b7280' }}>{t.noEntries}</Text>}
        renderItem={({ item }) => (
          <View style={{ borderBottomWidth:1, borderColor:'#f1f5f9', paddingVertical:6 }}>
            <View style={{ flexDirection:'row' }}>
              <Text style={{ flex:2 }}>{item.party} ({item.role})</Text>
              <Text style={{ flex:1, textAlign:'right' }}>{item.type==='debit'? item.amount : ''}</Text>
              <Text style={{ flex:1, textAlign:'right' }}>{item.type==='credit'? item.amount : ''}</Text>
            </View>
            {item.partyMobile ? <Text style={{ color:'#475569', fontSize:14 }}>{item.partyMobile}</Text> : null}
          </View>
        )}
      />
    </Card>
  );

  const Parties = () => (
    <Card>
      <View style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
        <TextInput placeholder={t.partyName} value={newParty} onChangeText={setNewParty} style={{ flex:1, borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12, fontSize:18, marginRight:6 }} />
        <TextInput placeholder="Mobile No" value={newMobile} onChangeText={setNewMobile} keyboardType="phone-pad" style={{ flex:1, borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12, fontSize:18 }} />
      </View>
      <Button title={t.addParty} onPress={addParty} style={{ marginBottom:12, backgroundColor:'#0ea5e9' }} />
      <FlatList
        data={parties}
        keyExtractor={(item)=>item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical:8, borderBottomWidth:1, borderColor:'#f1f5f9' }}>
            <Text style={{ fontSize:18 }}>{item.name}</Text>
            {item.mobile ? <Text style={{ color:'#475569' }}>{item.mobile}</Text> : null}
          </View>
        )}
      />
    </Card>
  );

  const Reports = () => (
    <Card>
      <Text style={{ fontSize:18, marginBottom:8 }}>{t.totalDebit}: {totals.debit}</Text>
      <Text style={{ fontSize:18, marginBottom:8 }}>{t.totalCredit}: {totals.credit}</Text>
      <Text style={{ fontSize:22, fontWeight:'700' }}>{t.balance}: {totals.balance}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#f8fafc', padding: 16 }}>
      <Header />
      <Nav />
      <View style={{ flex:1 }}>
        {tab==='home' && <Home />}
        {tab==='add' && <AddEntry />}
        {tab==='ledger' && <Ledger />}
        {tab==='parties' && <Parties />}
        {tab==='reports' && <Reports />}
      </View>
      <Text style={{ textAlign:'center', color:'#94a3b8', marginTop: 8 }}>Local-only storage. No internet required.</Text>
    </SafeAreaView>
  );
}
