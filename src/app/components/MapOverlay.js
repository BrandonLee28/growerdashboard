"use client";
import { useState } from "react";
import { ArrowLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import RegionDataPanel from "./RegionDataPanel.js";

const MapOverlay = ({
  toggleData,
  currentDataType,
  onRegionSelect,
  csvData,
  dataTypes,
  regionType = "county",
  legendMax,
  legendMin,
}) => {
  const router = useRouter();
  const [showPanel, setShowPanel] = useState(true);

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  };

  const handleGoBack = () => {
    router.push("/");
  };

  return (
    <div className="relative min-h-screen w-full" style={overlayStyle}>
      <div
        className="absolute top-4 left-4 z-10 flex gap-2"
        style={{ pointerEvents: "auto" }}
      >
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center gap-1 px-3 py-2 rounded-md cursor-pointer"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>
        <button
          className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg px-3 py-2 rounded-md cursor-pointer"
          onClick={() => setShowPanel(!showPanel)}
        >
          {showPanel ? "Hide Menu" : "Show Menu"}
        </button>
      </div>

      {showPanel && (
        <>
          <div
            className="absolute top-16 right-4 z-10"
            style={{ pointerEvents: "auto" }}
          >
            <RegionDataPanel
              onClose={() => setShowPanel(false)}
              onDataTypeChange={toggleData}
              onRegionSelect={onRegionSelect}
              currentDataType={currentDataType}
              csvData={csvData}
              dataTypes={dataTypes}
              regionType={regionType}
              legendMax={legendMax}
              legendMin={legendMin}
            />
          </div>

          <div className="absolute bottom-16 left-4 z-10 w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
              <h2 className="font-bold text-lg">Legend</h2>
            </div>

            <div className="p-4 bg-white">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-full bg-gradient-to-r from-green-500 via-orange-500 to-red-500 rounded-full"></div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MapOverlay;
