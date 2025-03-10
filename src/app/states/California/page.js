"use client";
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Map, Layer, Source, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import TopBar from "@/app/components/TopBar";
import ESTABPanel from "@/app/components/ESTABPanel";

const getColor = (value, min, max) => {
  const ratio = (value - min) / (max - min);
  const r = Math.round(255 * ratio);
  const g = Math.round(255 * (1 - ratio));
  return `rgb(${r},${g},0)`;
};

const CaliforniaChart = () => {
  const mapRef = useRef();
  const router = useRouter();
  const [selectedZip, setSelectedZip] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [data, setData] = useState("../to_zipcode_estab.csv");
  const toggleData = () => {
    if (data === "../to_zipcode_estab.csv") {
      setData("../outage.csv");
    } else {
      setData("../to_zipcode_estab.csv");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const geojsonResponse = await fetch("../calizipcode.json");
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

  useEffect(() => {
    if (selectedZip && geojsonData) {
      const feature = geojsonData.features.find(
        (f) => f.properties.ZCTA5CE10 === selectedZip,
      );

      if (feature) {
        const coordinates = feature.geometry.coordinates;
        let center;

        if (feature.geometry.type === "Polygon") {
          center = coordinates[0][0]; // First point of the first ring
        } else if (feature.geometry.type === "MultiPolygon") {
          // Find the centroid of the largest polygon
          const largestPolygon = coordinates.reduce(
            (largest, current) =>
              current[0].length > largest[0].length ? current : largest,
            coordinates[0],
          );
          center = largestPolygon[0][0]; // First point of the largest polygon
        }

        if (Array.isArray(center) && center.length === 2) {
          mapRef.current?.flyTo({
            center: center,
            zoom: 11,
            essential: true,
          });
        }
      }
    }
  }, [selectedZip]);

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
        ref={mapRef}
        initialViewState={{
          longitude: -119.4179,
          latitude: 36.7783,
          zoom: 6,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="../basestyle.json"
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
                "fill-color": [
                  "case",
                  ["==", ["get", "ZCTA5CE10"], selectedZip],
                  "#FB923C", // Highlight selected ZIP in red
                  ["get", "color"], // Default color
                ],
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

      {data == "../to_zipcode_estab.csv" && (
        <ESTABPanel
          geojsonData={geojsonData}
          selectedZip={selectedZip}
          setSelectedZip={setSelectedZip}
        />
      )}
      <TopBar router={router} data={data} toggleData={toggleData} />
    </div>
  );
};

export default CaliforniaChart;
