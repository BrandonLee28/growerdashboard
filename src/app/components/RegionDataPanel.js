"use client";

import { useState, useEffect } from "react";
import { Search, X, Info } from "lucide-react";
import getColor from "./getColor";

export default function RegionDataPanel({
  onClose,
  onDataTypeChange,
  onRegionSelect,
  currentDataType,
  csvData,
  dataTypes = [],
  regionType = "county",
  legendMax,
  legendMin,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionData, setRegionData] = useState([]);
  const [columnLabels, setColumnLabels] = useState({
    primary: regionType.charAt(0).toUpperCase() + regionType.slice(1),
    secondary: "Quantity",
  });

  // Capitalized region type for display
  const displayRegionType =
    regionType.charAt(0).toUpperCase() + regionType.slice(1);

  // Get current data type configuration
  const getCurrentDataTypeConfig = () => {
    return dataTypes.find((dt) => dt.key === currentDataType) || dataTypes[0];
  };

  useEffect(() => {
    if (csvData) {
      const processedData = Object.entries(csvData).map(
        ([region, quantity]) => ({
          region,
          quantity: quantity,
        }),
      );

      // Sort by quantity in descending order
      processedData.sort((a, b) => b.quantity - a.quantity);

      // Update column labels based on current data type
      const dataTypeConfig = getCurrentDataTypeConfig();
      setColumnLabels({
        primary: displayRegionType,
        secondary: `${dataTypeConfig.label} (${dataTypeConfig.unit})`,
      });

      setRegionData(processedData);
    }
  }, [csvData, currentDataType, dataTypes, displayRegionType]);

  const filteredData = regionData.filter((item) =>
    item.region.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatValue = (value) => {
    const dataTypeConfig = getCurrentDataTypeConfig();
    return dataTypeConfig.formatValue(value);
  };

  const handleRegionSelect = (region) => {
    onRegionSelect(region);
  };

  const handleDataTypeChange = (newDataType) => {
    onDataTypeChange(newDataType);
  };

  // Get current data type label for title
  const currentDataTypeLabel = getCurrentDataTypeConfig().label;

  // Get color class based on quantity
  const getColorClass = (quantity) => {
    const dataTypeConfig = getCurrentDataTypeConfig();
    const highThreshold = dataTypeConfig.highThreshold || 3000000;
    const mediumThreshold = dataTypeConfig.mediumThreshold || 100000;

    if (quantity > highThreshold) {
      return "text-red-600";
    } else if (quantity > mediumThreshold) {
      return "text-orange-500";
    } else {
      return "text-green-500";
    }
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
        <h2 className="font-bold text-lg">
          <span className="text-amber-400">{currentDataTypeLabel}</span>{" "}
          {displayRegionType} Data
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
            placeholder={`Search by ${regionType}...`}
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
          filteredData.map((item, index) => {
            const color = getColor(item.quantity, legendMin, legendMax);
            return (
              <div
                key={item.region}
                className={`grid grid-cols-2 p-3 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-indigo-50 transition-colors cursor-pointer`}
                onClick={() => handleRegionSelect(item.region)}
              >
                <div className="text-blue-600 font-medium">{item.region}</div>
                <div
                  className="text-right font-medium"
                  style={{ color: color }} // Apply dynamic color
                >
                  {formatValue(item.quantity)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-slate-500">No results found</div>
        )}
      </div>

      <div className="p-3 bg-indigo-50 text-xs text-slate-600 border-t border-slate-200">
        {getCurrentDataTypeConfig().description}
      </div>
    </div>
  );
}
