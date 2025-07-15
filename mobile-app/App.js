import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, FlatList, Button, TouchableOpacity, Image } from 'react-native';

const Stack = createNativeStackNavigator();
const API_URL = 'http://localhost:3000';

function TicketList({ navigation }) {
  const [tickets, setTickets] = useState([]);

  async function fetchTickets() {
    try {
      const cached = await AsyncStorage.getItem('tickets');
      if (cached) setTickets(JSON.parse(cached));
      const res = await fetch(`${API_URL}/tickets`);
      const data = await res.json();
      setTickets(data);
      await AsyncStorage.setItem('tickets', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <FlatList
      data={tickets}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Detail', { id: item.id })}>
          <View style={{ padding: 16, borderBottomWidth: 1 }}>
            <Text>{item.question}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

function TicketDetail({ route }) {
  const { id } = route.params;
  const [ticket, setTicket] = useState(null);
  const [image, setImage] = useState(null);

  async function load() {
    try {
      const res = await fetch(`${API_URL}/tickets/${id}`);
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function takePhoto() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const cam = await Camera.openCameraAsync({ allowsEditing: true });
      if (!cam.cancelled) setImage(cam.uri);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (!ticket) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>{ticket.question}</Text>
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <Button title="Attach Photo" onPress={takePhoto} />
    </View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      const enrolled = await LocalAuthentication.hasHardwareAsync();
      if (enrolled) {
        await LocalAuthentication.authenticateAsync();
      }
      await Notifications.requestPermissionsAsync();
      setReady(true);
    }
    prepare();
  }, []);

  if (!ready) return <View />;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tickets" component={TicketList} />
        <Stack.Screen name="Detail" component={TicketDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
