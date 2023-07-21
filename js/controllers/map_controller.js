import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";
import "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js";

export default class extends Controller {
  connect() {
    this.map = new maplibregl.Map({
      container: "map",
      center: [13.404, 52.52],
      zoom: 16,
      style:
        "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json",
    });

    this.map.on("load", () => {
      this.map.addSource("gewerbe", {
        type: "vector",
        // Note that the Maptiler key is restricted to allow only necessary origins:
        url: "https://api.maptiler.com/tiles/850fa78e-9186-4d0a-9e75-7f35c100a676/tiles.json?key=ABFU7feSA0DwvpFv68Pd",
      });

      this.map.addLayer({
        id: "gewerbe-layer",
        type: "circle",
        source: "gewerbe",
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

      this.map.on("mouseenter", "gewerbe-layer", (e) => {
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

    this.map.setFilter("gewerbe-layer", ["all", ...filters]);

    this.map.setPaintProperty("gewerbe-layer", "circle-opacity", [
      "interpolate",
      ["exponential", 0.5],
      ["-", ["get", "business_age"], newMinAge],
      0,
      1,
      100,
      0.2,
    ]);

    this.map.setPaintProperty("gewerbe-layer", "circle-stroke-color", [
      "case",
      ["==", 0, ["-", ["get", "business_age"], newMinAge]],
      "#1e40af",
      "#ffffff",
    ]);

    this.map.setPaintProperty("gewerbe-layer", "circle-stroke-opacity", [
      "case",
      ["==", 0, ["-", ["get", "business_age"], newMinAge]],
      1,
      0,
    ]);
  }

  getFilterByFeatureProperty(property) {
    const filterEntries = this.map.getFilter("gewerbe-layer");

    const propertyFilter = filterEntries?.find((filterEntry) =>
      JSON.stringify(filterEntry).includes(property)
    );

    return propertyFilter;
  }
}
