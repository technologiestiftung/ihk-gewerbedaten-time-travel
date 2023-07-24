import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";
import "https://unpkg.com/maplibre-gl@3.2.0/dist/maplibre-gl.js";
import {
  MAPTILER_BASEMAP_STYLE_JSON_URL,
  BUSINESSES_VECTOR_TILESET_URL,
} from "../utils/map-utils.js";
import {
  isValidAge as isValidBusinessAge,
  BUSINESSES_TILESET_PROPERTIES,
  getSelectedAge,
} from "../utils/businesses-util.js";

export default class extends Controller {
  static outlets = ["viz", "year"];

  connect() {
    let protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    this.map = new maplibregl.Map({
      container: "map",
      center: [13.404, 52.52],
      zoom: 14,
      style: MAPTILER_BASEMAP_STYLE_JSON_URL,
    });

    this.map.on("load", () => {
      this.map.addSource("businesses", {
        type: "vector",
        url: `pmtiles://${BUSINESSES_VECTOR_TILESET_URL}`,
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
            ["to-number", ["get", BUSINESSES_TILESET_PROPERTIES.age]],
          ],
        },
        paint: {
          "circle-color": "#DB0FF0",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 1, 16, 12],
          "circle-stroke-width": 2,
        },
      });
      this.updateFilters({ minAge: 0 });

      this.sendBusinessesToViz({ age: 0 });

      this.map.on("mouseenter", "businesses-layer", (e) => {
        console.log("Branche:", e.features[0].properties.ihk_branch_desc);
        console.log("Alter:", e.features[0].properties.business_age);
      });

      this.map.on("moveend", () => {
        this.sendBusinessesToViz({ age: getSelectedAge() });
      });
    });
  }

  updateFilters({ minAge: newMinAge, branch: newBranch }) {
    const existingAgeFilter = this.getFilterByFeatureProperty(
      BUSINESSES_TILESET_PROPERTIES.age
    );
    const existingBranchFilter = this.getFilterByFeatureProperty(
      BUSINESSES_TILESET_PROPERTIES.branch
    );

    const getBranchFilter = (branchKey) => {
      switch (true) {
        case branchKey === "all":
          return null;
        case typeof branchKey === "string":
          return [
            "==",
            ["get", BUSINESSES_TILESET_PROPERTIES.branch],
            branchKey,
          ];
        default:
          return existingBranchFilter;
      }
    };

    const filters = [
      newMinAge || newMinAge === 0
        ? [">=", ["get", BUSINESSES_TILESET_PROPERTIES.age], newMinAge]
        : existingAgeFilter,
      getBranchFilter(newBranch),
    ].filter(Boolean);

    this.map.setFilter("businesses-layer", ["all", ...filters]);

    if (isValidBusinessAge(newMinAge))
      this.styleCirclesByBusinessAge(newMinAge);
  }

  getFilterByFeatureProperty(property) {
    const filterEntries = this.map.getFilter("businesses-layer");

    const propertyFilter = filterEntries?.find((filterEntry) =>
      JSON.stringify(filterEntry).includes(property)
    );

    return propertyFilter;
  }

  styleCirclesByBusinessAge(businessAge) {
    this.map.setPaintProperty("businesses-layer", "circle-opacity", [
      "interpolate",
      ["exponential", 0.5],
      ["-", ["get", BUSINESSES_TILESET_PROPERTIES.age], businessAge],
      0,
      1,
      100,
      0.2,
    ]);

    this.map.setPaintProperty(
      "businesses-layer",
      "circle-stroke-color",
      "#000000"
    );

    this.map.setPaintProperty("businesses-layer", "circle-stroke-opacity", [
      "case",
      ["==", 0, ["-", ["get", BUSINESSES_TILESET_PROPERTIES.age], businessAge]],
      1,
      0,
    ]);
  }

  renderedBusinesses(filter) {
    return this.map.queryRenderedFeatures({
      layers: ["businesses-layer"],
      filter: filter,
    });
  }

  sendBusinessesToViz({ age }) {
    const updateViz = () => {
      const filter = isValidBusinessAge(age)
        ? ["==", ["get", "business_age"], age]
        : null;
      const renderedBusinesses = this.renderedBusinesses(filter);
      this.vizOutlet.updateViz(renderedBusinesses);
    };

    const mapIsLoaded = this.map.loaded();

    if (mapIsLoaded) {
      updateViz();
    } else {
      const idleListener = () => {
        updateViz();
        removeIdleListener();
      };

      const removeIdleListener = () => this.map.off("idle", idleListener);

      this.map.on("idle", idleListener);
    }
  }
}
