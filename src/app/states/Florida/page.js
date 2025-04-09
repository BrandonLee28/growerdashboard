"use client";
import * as React from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Map, Layer, Source, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import MapOverlay from "@/app/components/MapOverlay";
import getColor from "@/app/components/getColor";

const FloridaChart = (props) => {
  const {
    stateName = "Florida",
    regionType = "county",
    regionIdProperty = "NAME",
    initialViewCoordinates = {
      longitude: -81.5158,
      latitude: 27.6648,
      zoom: 6,
    },
    stateBounds = [
      [-87.6349, 24.396308],
      [-79.9743, 31.000968],
    ],
    dataTypes = [
      {
        key: `../california_data/california_county_estab_cleaned.csv`,
        label: "ESTAB",
        valueColumn: "Total ESTAB",
        description: "Total number of establishments by county",
        minValue: 0,
        maxValue: 1000000,
        formatValue: (value) => value.toLocaleString(),
        unit: "buildings",
      },
      {
        key: `../florida_data/florida_county_saidi_cleaned.csv`,
        label: "SAIDI",
        valueColumn: "SAIDI",
        description: "System Average Interruption Duration Index (minutes)",
        minValue: 0,
        maxValue: 300,
        formatValue: (value) => value.toFixed(2),
        unit: "mins",
      },
      {
        key: `../florida_data/florida_county_saifi_cleaned.csv`,
        label: "SAIFI",
        valueColumn: "SAIFI",
        description:
          "System Average Interruption Frequency Index (interruptions/year)",
        minValue: 0,
        maxValue: 3,
        formatValue: (value) => value.toFixed(2),
        unit: "freq",
      },
    ],
    geojsonPath = `../florida_data/Florida.geojson`,
  } = props;

  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const mapRef = useRef();
  const [processedGeojsonData, setProcessedGeojsonData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [currentDataType, setCurrentDataType] = useState(dataTypes[0].key);
  const [csvData, setCsvData] = useState({});

  const getCurrentDataTypeConfig = () => {
    return dataTypes.find((dt) => dt.key === currentDataType) || dataTypes[0];
  };

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch(geojsonPath);
        if (!response.ok) throw new Error("Failed to fetch GeoJSON");
        const geojson = await response.json();
        setGeojsonData(geojson);
      } catch (error) {
        console.error("Error fetching GeoJSON:", error);
      }
    };

    fetchGeoJSON();
  }, [geojsonPath]);

  useEffect(() => {
    const fetchCSVData = async () => {
      setIsDataLoading(true);

      try {
        const response = await fetch(currentDataType);
        if (!response.ok) throw new Error("Failed to fetch CSV");
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const dataTypeConfig = getCurrentDataTypeConfig();
            const dataMap = results.data.reduce((acc, row) => {
              const regionName =
                row[regionType === "zipcode" ? "ZipCode" : "County"]?.trim();
              if (regionName && row[dataTypeConfig.valueColumn]) {
                acc[regionName] = parseFloat(row[dataTypeConfig.valueColumn]);
              }
              return acc;
            }, {});

            setCsvData(dataMap);
            setIsDataLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setIsDataLoading(false);
          },
        });
      } catch (error) {
        console.error("Error fetching CSV:", error);
        setIsDataLoading(false);
      }
    };

    fetchCSVData();
  }, [currentDataType]);

  useEffect(() => {
    if (!geojsonData || isDataLoading || Object.keys(csvData).length === 0)
      return;

    const dataTypeConfig = getCurrentDataTypeConfig();
    const min = dataTypeConfig.minValue;
    const max = dataTypeConfig.maxValue;

    const updatedGeojson = {
      ...geojsonData,
      features: geojsonData.features.map((feature) => {
        const regionName = feature.properties[regionIdProperty];
        const value = csvData[regionName] || 0;
        return {
          ...feature,
          properties: {
            ...feature.properties,
            value,
            color: getColor(value, min, max),
          },
        };
      }),
    };

    setProcessedGeojsonData(updatedGeojson);
  }, [geojsonData, csvData, isDataLoading]);

  const toggleData = (newDataType) => {
    if (newDataType !== currentDataType) {
      setCurrentDataType(newDataType);
    }
  };

  const handleRegionSelect = (regionName) => {
    if (geojsonData) {
      const feature = geojsonData.features.find(
        (f) => f.properties[regionIdProperty] === regionName,
      );

      if (feature) {
        setSelectedRegion(regionName);

        const coordinates = feature.geometry.coordinates;
        let center;

        if (feature.geometry.type === "Polygon") {
          const polygon = coordinates[0];
          let sumX = 0,
            sumY = 0;
          for (let i = 0; i < polygon.length; i++) {
            sumX += polygon[i][0];
            sumY += polygon[i][1];
          }
          center = [sumX / polygon.length, sumY / polygon.length];
        } else if (feature.geometry.type === "MultiPolygon") {
          const largestPolygon = coordinates.reduce(
            (largest, current) =>
              current[0].length > largest[0].length ? current : largest,
            coordinates[0],
          );

          const polygon = largestPolygon[0];
          let sumX = 0,
            sumY = 0;
          for (let i = 0; i < polygon.length; i++) {
            sumX += polygon[i][0];
            sumY += polygon[i][1];
          }
          center = [sumX / polygon.length, sumY / polygon.length];
        }

        if (Array.isArray(center) && center.length === 2) {
          mapRef.current?.flyTo({
            center: center,
            zoom: regionType === "zipcode" ? 10 : 7,
            essential: true,
          });
        }
      }
    }
  };

  const dataTypeConfig = getCurrentDataTypeConfig();

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
        ref={mapRef}
        initialViewState={{
          longitude: initialViewCoordinates.longitude,
          latitude: initialViewCoordinates.latitude,
          zoom: initialViewCoordinates.zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        minZoom={5}
        maxZoom={12}
        dragPan={true}
        scrollZoom={true}
        doubleClickZoom={true}
        touchZoomRotate={true}
        keyboard={true}
        maxBounds={stateBounds}
        interactiveLayerIds={processedGeojsonData ? ["region-layer"] : []}
        onMouseMove={(event) => {
          const feature = event.features?.[0];
          if (feature) {
            const regionName = feature.properties[regionIdProperty];
            setHoveredCounty(regionName);
            setHoverPosition({
              x: event.point.x,
              y: event.point.y,
            });

            const dataTypeConfig = getCurrentDataTypeConfig();
            const value = csvData[regionName] || 0;

            setHoverInfo({
              region: regionName,
              state: stateName,
              value: value,
            });
          } else {
            setHoveredCounty(null);
            setHoverInfo(null);
          }
        }}
        onMouseLeave={() => {
          setHoveredCounty(null);
        }}
      >
        {processedGeojsonData && (
          <Source id="regions" type="geojson" data={processedGeojsonData}>
            {/* Main fill layer with conditional styling */}
            <Layer
              id="region-layer"
              type="fill"
              paint={{
                "fill-color": [
                  "case",
                  ["==", ["get", regionIdProperty], selectedRegion],
                  "#FFCA28",
                  ["==", ["get", regionIdProperty], hoveredCounty],
                  "#FFCA28",
                  ["get", "color"],
                ],
                "fill-opacity": [
                  "case",
                  ["==", ["get", regionIdProperty], hoveredCounty],
                  0.9,
                  0.9,
                ],
              }}
            />

            <Layer
              id="region-hover"
              type="fill"
              paint={{
                "fill-color": "#FFCA28",
                "fill-opacity": 0.1,
              }}
              filter={["==", ["get", regionIdProperty], hoveredCounty || ""]}
            />

            <Layer
              id="region-borders"
              type="line"
              paint={{
                "line-color": "#000",
                "line-width": [
                  "case",
                  ["==", ["get", regionIdProperty], hoveredCounty],
                  1.5,
                  0.5,
                ],
              }}
            />
          </Source>
        )}

        <MapOverlay
          toggleData={toggleData}
          currentDataType={currentDataType}
          onRegionSelect={handleRegionSelect}
          csvData={csvData}
          dataTypes={dataTypes}
          regionType={regionType}
          legendMax={dataTypeConfig.maxValue}
          legendMin={dataTypeConfig.minValue}
        />
      </Map>

      <AnimatePresence>
        {hoveredCounty && hoverInfo && (
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
            <div className="bg-amber-400 text-white px-3 py-1.5 rounded-md shadow-md text-sm font-medium">
              <strong>
                {regionType.charAt(0).toUpperCase() + regionType.slice(1)}:{" "}
                {hoverInfo.region}
              </strong>
              <br />
              {getCurrentDataTypeConfig().label}:{" "}
              {getCurrentDataTypeConfig().formatValue(hoverInfo.value)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloridaChart;
