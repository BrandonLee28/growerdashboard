const ESTABPanel = ({ geojsonData, setSelectedZip, selectedZip }) => {
  return (
    <div className="estab-visualization">
      <div className="estab-visualization-header font-bold">ESTAB</div>
      <div className="flex justify-between text-center text-blue-500">
        <span className="text-[10px] shadow-none estab-visualization-header font-semibold text-white pl-5">
          ZipCode
        </span>
        <span className="text-[10px] shadow-none font-semibold text-white estab-visualization-header pr-5">
          Quantity
        </span>
      </div>
      {geojsonData &&
        geojsonData.features
          .slice()
          .sort((a, b) => b.properties.estab - a.properties.estab)
          .map((feature) => (
            <div
              key={feature.properties.ZCTA5CE10}
              className={`flex text-blue-500 justify-between p-2 border-b cursor-pointer text-center ${
                selectedZip === feature.properties.ZCTA5CE10
                  ? "bg-orange-400"
                  : ""
              }`}
              onClick={() => setSelectedZip(feature.properties.ZCTA5CE10)}
            >
              <span className="pl-10">{feature.properties.ZCTA5CE10}</span>
              <span className="pr-10">{feature.properties.estab}</span>
            </div>
          ))}
    </div>
  );
};

export default ESTABPanel;
