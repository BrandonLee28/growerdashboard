"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function CountyDataPanel({
  onClose,
  onDataTypeChange,
  onCountySelect,
  currentDataType,
  csvData,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [countyData, setCountyData] = useState([]);
  const [columnLabels, setColumnLabels] = useState({
    primary: "County",
    secondary: "Quantity",
  });

  // Data type options
  const dataTypes = [
    {
      key: "../california_data/california_county_estab_cleaned.csv",
      label: "ESTAB",
    },
    {
      key: "../california_data/california_county_saidi_cleaned.csv",
      label: "SAIDI",
    },
    {
      key: "../california_data/california_county_saifi_cleaned.csv",
      label: "SAIFI",
    },
  ];

  useEffect(() => {
    if (csvData) {
      const processedData = Object.entries(csvData).map(
        ([county, quantity]) => ({
          county,
          quantity: quantity,
        }),
      );

      processedData.sort((a, b) => b.quantity - a.quantity);

      if (currentDataType.includes("estab")) {
        setColumnLabels({
          primary: "County",
          secondary: "ESTAB (buildings)",
        });
      } else {
        setColumnLabels({
          primary: "County",
          secondary: currentDataType.includes("saidi")
            ? "SAIDI (mins)"
            : "SAIFI (freq)",
        });
      }

      setCountyData(processedData);
    }
  }, [csvData, currentDataType]);

  const filteredData = countyData.filter((item) =>
    item.county.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatValue = (value) => {
    return currentDataType.includes("estab")
      ? value.toLocaleString()
      : value.toFixed(2);
  };

  const handleCountySelect = (county) => {
    onCountySelect(county);
  };

  const handleDataTypeChange = (newDataType) => {
    onDataTypeChange(newDataType);
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
        <h2 className="font-bold text-lg">
          <span className="text-amber-400">
            {currentDataType.includes("estab")
              ? "ESTAB"
              : currentDataType.includes("saidi")
                ? "SAIDI"
                : "SAIFI"}
          </span>{" "}
          County Data
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="h-8 w-8 text-white hover:bg-indigo-700 hover:text-white rounded-md flex items-center justify-center"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-3 bg-indigo-50 flex justify-between">
        {dataTypes.map((type) => (
          <button
            key={type.key}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer 
              ${
                currentDataType === type.key
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
              }`}
            onClick={() => handleDataTypeChange(type.key)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="p-3 bg-indigo-50">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by county..."
            className="text-black w-full pl-8 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 bg-indigo-100 p-3 font-medium text-indigo-900">
        <div>{columnLabels.primary}</div>
        <div className="text-right">{columnLabels.secondary}</div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div
              key={item.county}
              className={`grid grid-cols-2 p-3 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-indigo-50 transition-colors cursor-pointer`}
              onClick={() => handleCountySelect(item.county)}
            >
              <div className="text-blue-600 font-medium">{item.county}</div>
              <div className="text-right text-slate-700">
                {formatValue(item.quantity)}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-slate-500">No results found</div>
        )}
      </div>

      <div className="p-3 bg-indigo-50 text-xs text-slate-600 border-t border-slate-200">
        {currentDataType.includes("estab") && (
          <p>Establishments count by county</p>
        )}
        {currentDataType.includes("saidi") && (
          <p>System Average Interruption Duration Index (minutes)</p>
        )}
        {currentDataType.includes("saifi") && (
          <p>
            System Average Interruption Frequency Index (interruptions/year)
          </p>
        )}
      </div>
    </div>
  );
}
