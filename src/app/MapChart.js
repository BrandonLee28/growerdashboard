"use client";
import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Layer, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const geoJsonUrl = "../us-states.json";

const MapChart = () => {
  const [selectedState, setSelectedState] = useState(null);
  const router = useRouter();

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
          longitude: -98.5795,
          latitude: 39.8283,
          zoom: 4.5,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        dragPan={false}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
        interactiveLayerIds={["state-fills"]}
        onClick={(event) => {
          const state = event.features?.[0]?.properties?.name;
          console.log(state);
          if (state) {
            setSelectedState(state);
            router.push(`/states/${state}`);
          }
        }}
      >
        <Source id="states" type="geojson" data={geoJsonUrl}>
          <Layer
            id="state-fills"
            type="fill"
            paint={{
              "fill-color": [
                "case",
                ["==", ["get", "name"], selectedState],
                "#FF5733",
                "#007AFF",
              ],
              "fill-opacity": 0.5,
            }}
          />
          <Layer
            id="state-borders"
            type="line"
            paint={{
              "line-color": "#000",
              "line-width": 0.5,
            }}
          />
        </Source>
      </Map>
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "50%",
          transform: "translate(-50%, 0)",
          zIndex: 10,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "15px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h1 className="font-extrabold p-[5px] text-blue-400 text-xl">
          Select a State for Outage Data
        </h1>
      </div>
    </div>
  );
};

export default MapChart;
