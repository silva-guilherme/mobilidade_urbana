"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


delete (L.Icon.Default.prototype as any)._getIconUrl;


const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [35, 35],
});


const fimIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});


function getCorLotacao(lotacao: string) {
  if (lotacao === "alta") return "red";
  if (lotacao === "media") return "orange";
  return "green";
}


function criarIcone(numero: number, cor: string) {
  return L.divIcon({
    html: `
      <div style="
        background:${cor};
        width:30px;
        height:30px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:bold;
        border:2px solid white;
      ">
        ${numero}
      </div>
    `,
    className: "",
  });
}


function AjustarMapa({ coords }: any) {
  const map = useMap();

  useEffect(() => {
    if (coords.length > 0) {
      map.fitBounds(coords);
    }
  }, [coords]);

  return null;
}

export default function MapaRota() {
  const params = useParams();
  const id = params?.id;

  const [coords, setCoords] = useState<any[]>([]);
  const [paradas, setParadas] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8000/rotas/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.itinerario) {
          const pontos = data.itinerario.map((p: any) => [
            p.latitude,
            p.longitude,
          ]);

          setCoords(pontos);
          setParadas(data.itinerario);
        }
      });
  }, [id]);

  if (coords.length === 0) {
    return <p style={{ padding: 20 }}>Carregando mapa...</p>;
  }

  return (
    <div style={{ height: "calc(100vh - 20px)", width: "100%" }}>
      <MapContainer
        center={coords[0]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AjustarMapa coords={coords} />

        {/*  Linha da rota */}
        <Polyline positions={coords} color="blue" weight={5} />

        {/*  Início */}
        <Marker position={coords[0]} icon={busIcon}>
          <Popup>🚌 Início da rota</Popup>
        </Marker>

        {/*  Fim */}
        <Marker position={coords[coords.length - 1]} icon={fimIcon}>
          <Popup>Fim da rota</Popup>
        </Marker>

        {/* Paradas com lotação */}
        {paradas.map((p: any, index: number) => {
          const cor = getCorLotacao(p.lotacao || "baixa");

          return (
            <Marker
              key={index}
              position={[p.latitude, p.longitude]}
              icon={criarIcone(p.ordem_parada, cor)}
            >
              <Popup>
                <strong>Parada #{p.ordem_parada}</strong>
                <br />
                Tempo: {p.tempo_estimado} min
                <br />
                Lotação: {p.lotacao || "baixa"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}