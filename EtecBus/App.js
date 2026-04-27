import React, { useState, useEffect, useRef } from 'react';
import { Activityindicator, TouchableOpacity, Platform, Linking, Style } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';

//Configurações de Localização
const SCHOOL = {
  id: 'school',
  name: 'ETEC Comendador João Rays',
  coordinate: { latitude: -22.5249399, longitude: -48.5629355 },
  address: 'Rua Ludovico Victório, 2140, Barra Bonita - SP',
}

const BUS_STOPS = [
  {
    id: 'stop_1',
    name: 'Autoescola Muriano',
    address: 'R. Geraldo Fazzio, 484',
    coordinate: { latitude: -22.48406745366516, longitude: -48.56464177356464 },
    lines: ['Nova Barra'],
  },
  {

  }
]

//Distância Haversine (metros)
function getDistance(c1, c2) {
  const R = 6371e3; // Raio da Terra em metros
  const q1 = (c1.latitude * Math.PI / 180);
  const q2 = (c2.latitude * Math.PI / 180);
  const dq = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const dt = ((c2.longitude - c1.longitude) * Math.PI) / 180;
  const a = Math.sin(dq / 2) * Math.sin(dq / 2) + Math.cos(q1) * Math.cos(q2) * Math.sin(dt / 2) * Math.sin(dt / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

//HTML do Leaflet (OpenStreeMap - sem chave)
function buildLeaftHTML(userCoord, nearStopId, selectedStopId) {
  const stopsJSON = JSON.stringify(BUS_STOPS);
  const schoolJSON = JSON.stringify(SCHOOL);
  const userJSON = userCoord ? JSON.stringify(userCoord) : null;

  return `<!DOCTYPE html>
<html>
<head>`;
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Vamos lá</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
