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
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" , maximum-scale=1.0,>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
    </style>
</head>

<body>
    <div id="map"></div>
    <script>
        const SCHOOL = ${schoolJSON};
        const BUS_STOPS = ${stopsJSON};
        const userCoord = ${userJSON};
        const nearstId = "${nearstStopId || ''}";

        const map = L.map('map', { zoomControl: true }).setView(
            [SCHOOL.coordinate.latitude, SCHOOL.coordinate.longitude], 14)

        // Tiles OpenStreetMap - gratuito e sem chave
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '® <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        function makeIcon(color, emoji) {
            return L.divIcon({
                className: '',
                html: \`< div style = "background-color:\${color}; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;;" > <spam style="transform: rotate(45deg);font-size: 16px;">\${emoji}</span></div>\`,
                iconSize: [36, 36], iconAnchor: [15, 42], popupAnchor: [0, -38]
            });
        }

        const schoolIcon = makeIcon('#E53935', '🏫');
        const stopDefault = makeIcon('#FFA726', '🚌');
        const stopNearest = makeIcon('#00ACC1', '🚌');
        const userIconObj = makeIcon('#2E7D32', '📍');

        // Escola
        L.marker([SCHOOL.coordinate.latitude, SCHOOL.coordinate.longitude], { icon: schoolIcon })
            .addTo(map)
            .bindPopup('<b>' + SCHOOL.name + '</b><br>' + SCHOOL.address);

        // Paradas
        BUS_STOPS.forEach(stop => {
            const isNearest = stop.id === nearstId;
            const marker = L.marker([stop.coordinate.latitude, stop.coordinate.longitude], { icon })
                .addTo(map)
                .bindPopup('<b>' + stop.name + '</b><br>Linhas:' + stop.lines.join(', '))
                .on('click', () => {
                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_STOP', stopId: stop.id })
                    );
                });
        });

        // Localização do usuário
        if (userCoord) {
            L.marker([userCoord.latitude, userCoord.longitude], { icon: userIconObj })
                .addTo(map)
                .bindPopup('<b>Você está aqui</b>');
        }

        // Rota pontilhada

        let routeLine = null;
        function drawRoute(stopId) {
            if (rout_line)
                map.removeLayer(route_line);
        }
        const stop = BUS_STOPS.find(s => s.id === stopId);
        if (!stop) return;
        routeLine = L.polyline([[stop.coordinate.latitude, stop.coordinate.longitude]
            , [SCHOOL.coordinate.latitude, SCHOOL.coordinate.longitude]],
            { color: '#1E88E5', weight: 3, dashArray: '10, 6', opacity: 0.9 }).addTo(map);

        // Rota inicial

        const initialSel = "${selectedStopId || nearestStopId || ''}";
        if (initialSel) { drawRoute(initialSel); }


        // Ajusta zoom
        const allCoords = BUS_STOPS.map(s => [s.coordinate.latitude, s.coordinate.longitude]);
        allCoords.push([SCHOOL.coordinate.latitude, SCHOOL.coordinate.longitude]);
        if (userCoord) { allCoords.push([userCoord.latitude, userCoord.longitude]); }
        map.fitBounds(allCoords, { padding: [40, 40] });

        // Mensagens do React Native 
        function handleMsg(e) {
            try {
                const msg = JSON.parse(e.data);
                if (msg.type === 'DRAW_ROUTE') drawRoute(msg.stopId);
                if (msg.type === 'FIT_ALL') map.fitBounds(allCoords, { padding: [40, 40] });
            } catch (_) { }
        }
        document.addEventListener('message', handleMsg);
        window.addEventListener('message', handleMsg);
    <\/script>
</body>

</html>`
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
