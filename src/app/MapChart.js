"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Layer, Source, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const geoJsonUrl = "./us-states.json";

const MapChart = () => {
  const [selectedState, setSelectedState] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [hoverInfo, setHoverInfo] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const router = useRouter();
  const usBounds = [
    [-128.0, 22.0],
    [-65.0, 52.0],
  ];

  const slugify = (name) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      className="bg-white"
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
          longitude: -96.5348,
          latitude: 38.7946,
          zoom: 3.6,
        }}
        style={{ width: "100%", height: "100%" }}
        dragPan={true}
        dragRotate={false}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
        interactiveLayerIds={["state-fills"]}
        maxBounds={usBounds}
        minZoom={3.2}
        maxZoom={4.0}
        fitBoundsOptions={{
          padding: 60,
          duration: 0,
        }}
        onMouseMove={(event) => {
          const feature = event.features?.[0];
          if (feature) {
            setHoveredState(feature.properties.name);
            setHoverPosition({
              x: event.point.x,
              y: event.point.y,
            });
          } else {
            setHoveredState(null);
          }
        }}
        onMouseLeave={() => {
          setHoveredState(null);
        }}
        onLoad={(evt) => {
          const map = evt.target;
          map.fitBounds(usBounds, {
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
          });
          setMapLoaded(true);
        }}
        onClick={(event) => {
          const state = event.features?.[0]?.properties?.name;
          console.log(state);
          if (state) {
            setSelectedState(state);

            router.push(`/states/${slugify(state)}`);
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
                "#FB923C",
                ["==", ["get", "name"], hoveredState],
                "#6366F1",
                "#94A3B8",
              ],
              "fill-opacity": [
                "case",
                ["==", ["get", "name"], hoveredState],
                0.8,
                0.5,
              ],
            }}
          />

          <Layer
            id="state-hover"
            type="fill"
            paint={{
              "fill-color": "#6366F1",
              "fill-opacity": 0.1,
            }}
            filter={["==", ["get", "name"], hoveredState || ""]}
          />

          <Layer
            id="state-borders"
            type="line"
            paint={{
              "line-color": "#000",
              "line-width": [
                "case",
                ["==", ["get", "name"], hoveredState],
                1.5,
                0.5,
              ],
            }}
          />
        </Source>
        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            className="z-10"
          >
            <div className="text-blue-400">
              <strong>State: {hoverInfo.state}</strong>
            </div>
          </Popup>
        )}
      </Map>
      <AnimatePresence>
        {hoveredState && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute pointer-events-none z-20"
            style={{
              left: hoverPosition.x,
              top: hoverPosition.y - 40,
              transform: "translateX(-50%)",
            }}
          >
            <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-md shadow-md text-sm font-medium">
              {hoveredState}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-0 left-0 right-0 flex justify-center mt-4 z-10">
        <button className="bg-indigo-600  text-white shadow-lg flex items-center gap-1 px-3 py-2 rounded-md cursor-pointer">
          <span>Select a State</span>
        </button>
      </div>
    </div>
  );
};

export default MapChart;
