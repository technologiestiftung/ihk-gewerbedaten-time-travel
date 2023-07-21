import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";
import "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js";
import {
  MAPTILER_BASEMAP_STYLE_JSON_URL,
  BUSINESSES_VECTOR_TILESET_URL,
} from "../utils/map-utils.js";

export default class extends Controller {
  connect() {
    this.map = new maplibregl.Map({
      container: "map",
      center: [13.404, 52.52],
      zoom: 16,
      style: MAPTILER_BASEMAP_STYLE_JSON_URL,
    });

    this.map.on("load", () => {
      this.map.addSource("businesses", {
        type: "vector",
        url: BUSINESSES_VECTOR_TILESET_URL,
      });

      this.map.addLayer({
        id: "businesses-layer",
        type: "circle",
        source: "businesses",
        "source-layer": "ihk",
        layout: {
          visibility: "visible",
          "circle-sort-key": [
            "-",
            new Date().getFullYear(),
            ["to-number", ["get", "business_age"]],
          ],
        },
        paint: {
          "circle-color": "#ff0000",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 2, 16, 12],
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["get", "business_age"],
            0,
            1,
            100,
            0.2,
          ],
          "circle-stroke-width": 3,
        },
      });
      this.updateFilters({ minAge: 0 });

      this.map.on("mouseenter", "businesses-layer", (e) => {
        console.log(e.features[0].properties?.branch_top_level_desc);
      });
    });
  }

  updateFilters({ minAge: newMinAge, branch: newBranch }) {
    const FILTER_PROPERTIES = {
      business_age: "business_age",
      branch: "branch_top_level_desc",
    };

    const existingAgeFilter = this.getFilterByFeatureProperty(
      FILTER_PROPERTIES.business_age
    );
    const existingBranchFilter = this.getFilterByFeatureProperty(
      FILTER_PROPERTIES.branch
    );

    const getBranchFilter = (branchKey) => {
      switch (true) {
        case branchKey === "all":
          return null;
        case typeof branchKey === "string":
          return ["==", ["get", FILTER_PROPERTIES.branch], branchKey];
        default:
          return existingBranchFilter;
      }
    };

    const filters = [
      newMinAge || newMinAge === 0
        ? [">=", ["get", FILTER_PROPERTIES.business_age], newMinAge]
        : existingAgeFilter,
      getBranchFilter(newBranch),
    ].filter(Boolean);

    this.map.setFilter("businesses-layer", ["all", ...filters]);

    this.map.setPaintProperty("businesses-layer", "circle-opacity", [
      "interpolate",
      ["exponential", 0.5],
      ["-", ["get", "business_age"], newMinAge],
      0,
      1,
      100,
      0.2,
    ]);

    this.map.setPaintProperty("businesses-layer", "circle-stroke-color", [
      "case",
      ["==", 0, ["-", ["get", "business_age"], newMinAge]],
      "#1e40af",
      "#ffffff",
    ]);

    this.map.setPaintProperty("businesses-layer", "circle-stroke-opacity", [
      "case",
      ["==", 0, ["-", ["get", "business_age"], newMinAge]],
      1,
      0,
    ]);
  }

  getFilterByFeatureProperty(property) {
    const filterEntries = this.map.getFilter("businesses-layer");

    const propertyFilter = filterEntries?.find((filterEntry) =>
      JSON.stringify(filterEntry).includes(property)
    );

    return propertyFilter;
  }
}
