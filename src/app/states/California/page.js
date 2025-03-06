"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Map, Layer, Source, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const getColor = (value, min, max) => {
  const ratio = (value - min) / (max - min);
  const r = Math.round(255 * ratio);
  const g = Math.round(255 * (1 - ratio));
  return `rgb(${r},${g},0)`;
};

const CaliforniaChart = () => {
  const router = useRouter();
  const [geojsonData, setGeojsonData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [data, setData] = useState("/to_zipcode_estab.csv");
  const toggleData = () => {
    if (data === "/to_zipcode_estab.csv") {
      setData("/outage.csv");
    } else {
      setData("/to_zipcode_estab.csv");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const geojsonResponse = await fetch(
        "https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/refs/heads/master/ca_california_zip_codes_geo.min.json",
      );
      const geojson = await geojsonResponse.json();

      const csvResponse = await fetch(data);
      const csvText = await csvResponse.text();

      const parsedCsv = Papa.parse(csvText, { header: true });

      const csvData = parsedCsv.data.reduce((acc, row) => {
        const zip = row.ZCTA5CE20?.toString().padStart(5, "0");
        acc[zip] = parseFloat(row.ESTAB) || 0;
        return acc;
      }, {});

      const minEstab = 3;
      const maxEstab = 1000;

      geojson.features = geojson.features.map((feature) => {
        const zip = feature.properties.ZCTA5CE10;
        feature.properties.estab = csvData[zip] || 0;
        feature.properties.color = getColor(
          feature.properties.estab,
          minEstab,
          maxEstab,
        );
        return feature;
      });

      setGeojsonData(geojson);
    };

    fetchData();
  }, [data]);

  const californiaBounds = [
    [-124.482003, 32.528832],
    [-113.499592, 42.009518],
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <Map
        initialViewState={{
          longitude: -119.4179,
          latitude: 36.7783,
          zoom: 6,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        minZoom={6}
        maxZoom={10}
        dragPan={true}
        scrollZoom={true}
        doubleClickZoom={true}
        touchZoomRotate={true}
        keyboard={true}
        maxBounds={californiaBounds}
        interactiveLayerIds={geojsonData ? ["zipcode-layer"] : []}
        onMouseMove={(event) => {
          const feature = event.features?.[0];
          setHoverInfo(
            feature
              ? {
                  longitude: event.lngLat.lng,
                  latitude: event.lngLat.lat,
                  estab: feature.properties.estab,
                  zipcode: feature.properties.ZCTA5CE10,
                }
              : null,
          );
        }}
      >
        {geojsonData && (
          <Source id="zipcodes" type="geojson" data={geojsonData}>
            <Layer
              id="zipcode-layer"
              type="fill"
              paint={{
                "fill-color": ["get", "color"],
                "fill-opacity": 0.7,
              }}
            />
            <Layer
              id="zipcode-borders"
              type="line"
              paint={{
                "line-color": "#000",
                "line-width": 0.5,
              }}
            />
          </Source>
        )}

        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
          >
            <div className="text-blue-400">
              <strong>ZIP Code: {hoverInfo.zipcode}</strong>
              <br />
              Establishments: {hoverInfo.estab}
            </div>
          </Popup>
        )}
      </Map>

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translate(-50%, 0)",
          zIndex: 10,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "10px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <button
          onClick={() => {
            router.push("/");
          }}
          style={{
            backgroundColor: "#007AFF",
            color: "white",
            border: "none",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>

        <button
          className="ml-2 bg-orange-400"
          onClick={() => {
            toggleData();
          }}
          style={{
            color: "white",
            border: "none",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          {data === "/to_zipcode_estab.csv" ? "ESTAB" : "Outage"}
        </button>
      </div>
    </div>
  );
};

export default CaliforniaChart;
