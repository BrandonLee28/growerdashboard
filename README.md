**Documentation: Customizing and Expanding State Chart Visualization**

### Overview
This documentation explains how to modify the existing `StateChart` component to visualize data for different states. The instructions cover updating necessary parameters, data sources, and region specifications.

---

### Steps to Customize for a Different State

#### 1. **Rename the Component**
Change the component name to match the new state, e.g., `TexasChart` for Texas.

```javascript
const TexasChart = (props) => {
```

#### 2. **Update State Information**
Modify the following props to reflect the new state:

```javascript
const {
  stateName = "Texas", // Update state name
  stateAbbreviation = "TX", // Update state abbreviation
  regionType = "county", // Change to "zipcode" if needed
  regionIdProperty = "NAME", // Update if the GeoJSON property differs
```

#### 3. **Update Initial View Coordinates**
Modify `longitude`, `latitude`, and `zoom` to center the view on the new state.

```javascript
initialViewCoordinates = {
  longitude: -99.0, // Update longitude
  latitude: 31.0, // Update latitude
  zoom: 6, // Adjust zoom level if needed
},
```

#### 4. **Adjust State Boundaries**
Update the state bounds to match the top-left and bottom-right coordinates.

```javascript
stateBounds = [
  [-106.6456, 25.8371], // Top-left coordinates
  [-93.5083, 36.5007], // Bottom-right coordinates
],
```

#### 5. **Modify Data Sources**
Change the file paths for CSV data to match the new state's dataset.

```javascript
dataTypes = [
  {
    key: "../texas_data/texas_county_estab_cleaned.csv", // Update path
    label: "ESTAB",
    valueColumn: "Total ESTAB",
    description: "Establishments count by region",
    minValue: 0,
    maxValue: 200000,
    formatValue: (value) => value.toLocaleString(),
    unit: "buildings",
  },
  {
    key: "../texas_data/texas_county_saidi_cleaned.csv", // Update path
    label: "SAIDI",
    valueColumn: "SAIDI",
    description: "System Average Interruption Duration Index (minutes)",
    minValue: 0,
    maxValue: 300,
    formatValue: (value) => value.toFixed(2),
    unit: "mins",
  },
  {
    key: "../texas_data/texas_county_saifi_cleaned.csv", // Update path
    label: "SAIFI",
    valueColumn: "SAIFI",
    description: "System Average Interruption Frequency Index (interruptions/year)",
    minValue: 0,
    maxValue: 3,
    formatValue: (value) => value.toFixed(2),
    unit: "freq",
  },
],
```

#### 6. **Update GeoJSON Path**
Set the `geojsonPath` to the corresponding file for the new state.

```javascript
geojsonPath = "../texas_data/texas_counties.geojson";
```

#### 7. **Update Region Name Handling**
Ensure that the correct column is referenced in the CSV file for counties or zip codes.

```javascript
const regionName = row[regionType === "zipcode" ? "ZipCode" : "County"]?.trim();
```

#### 8. **Test the Visualization**
Run the application and verify that:
- The map centers correctly on the selected state.
- The CSV data is loading properly.
- Hovering over a region displays correct information.
- Clicking on a region updates the selection.

---

### Additional Notes
- If a new data type is introduced, add it to the `dataTypes` array with the correct file path, value column, and formatting.
- Adjust `minValue` and `maxValue` for color scaling to fit the data range.
- If using a different region type (e.g., `zipcode` instead of `county`), ensure that `regionIdProperty` and data column names match accordingly.
- If you encounter any bugs or issues while making these modifications, feel free to use AI tools to help debug and resolve them.

By following these steps, team members can efficiently expand and customize the visualization for multiple states.

