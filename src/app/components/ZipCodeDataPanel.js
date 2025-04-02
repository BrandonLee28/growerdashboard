"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function ZipCodeDataPanel({
  onClose,
  onDataTypeChange,
  onZipSelect,
  currentDataType,
  csvData,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [zipcodeData, setZipcodeData] = useState([]);
  const [columnLabels, setColumnLabels] = useState({
    primary: "Zip Code",
    secondary: "Quantity",
  });

  const dataTypes = [
    { key: "../to_zipcode_estab.csv", label: "ESTAB" },
    { key: "../saidi_saifi.csv", label: "SAIDI" },
    { key: "../to_zipcode_saifi.csv", label: "SAIFI" },
  ];

  useEffect(() => {
    if (csvData) {
      const processedData = Object.entries(csvData).map(
        ([zipcode, quantity]) => ({
          zipcode: zipcode.toString().padStart(5, "0"),
          quantity: quantity,
        }),
      );

      processedData.sort((a, b) => b.quantity - a.quantity);

      if (currentDataType.includes("estab")) {
        setColumnLabels({
          primary: "Zip Code",
          secondary: "Establishments",
        });
      } else {
        setColumnLabels({
          primary: "Zip Code",
          secondary: currentDataType.includes("saidi")
            ? "SAIDI (mins)"
            : "SAIFI (freq)",
        });
      }

      setZipcodeData(processedData);
    }
  }, [csvData, currentDataType]);

  const filteredData = zipcodeData.filter((item) =>
    item.zipcode.includes(searchTerm),
  );

  const formatValue = (value) => {
    return currentDataType.includes("estab")
      ? value.toLocaleString()
      : value.toFixed(2);
  };

  const handleZipSelect = (zipcode) => {
    onZipSelect(zipcode);
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
          Zip Code Data
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
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors 
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
            placeholder="Search by zip code..."
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
              key={item.zipcode}
              className={`grid grid-cols-2 p-3 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-indigo-50 transition-colors cursor-pointer`}
              onClick={() => handleZipSelect(item.zipcode)}
            >
              <div className="text-blue-600 font-medium">{item.zipcode}</div>
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
          <p>Establishments count by zip code</p>
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
