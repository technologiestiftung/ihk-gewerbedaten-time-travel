import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js";
import "https://unpkg.com/maplibre-gl@3.2.0/dist/maplibre-gl.js";
import {
  MAPTILER_BASEMAP_STYLE_JSON_URL,
  BUSINESSES_VECTOR_TILESET_URL,
} from "../utils/map-utils.js";
import {
  isValidAge as isValidBusinessAge,
  BUSINESSES_TILESET_PROPERTIES,
  getSelectedAge,
  getBusinessInceptionYear,
} from "../utils/businesses-util.js";

export default class extends Controller {
  static outlets = ["viz", "year"];

  connect() {
    let protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    this.map = new maplibregl.Map({
      container: "map",
      center: [13.404, 52.52],
      zoom: 12,
      maxZoom: 16.5,
      minZoom: 11.5,
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
          "circle-color": "#e60032",
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11.5,
            4,
            16.5,
            14,
          ],
          "circle-stroke-width": 1,
        },
      });

      this.updateFilters({ minAge: getSelectedAge() });
      this.sendBusinessesToViz({ age: getSelectedAge() });

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      this.map.on("mouseenter", "businesses-layer", (e) => {
        const table = this.createPopupTable(e.features, [
          "Branche",
          "Gründungsjahr",
        ]);

        const [latitude, longitude] = e.features[0].geometry.coordinates;

        popup
          .setLngLat([latitude, longitude])
          .setHTML(table.outerHTML)
          .addTo(this.map);
      });

      this.map.on("mouseleave", "businesses-layer", () => {
        popup.remove();
      });

      this.map.on("moveend", () => {
        this.sendBusinessesToViz({ age: getSelectedAge() });
      });
    });
  }

  /**
   * Updates the map filters so that circles are conditionally rendered depending on the provided options.
   * @param {{minAge: number, branch: string}} options
   * @returns void
   */
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

  /**
   * Retrives Maplibre GL JS filter object matching provided feature property.
   * @param {*} property
   * @returns any
   */
  getFilterByFeatureProperty(property) {
    const filterEntries = this.map.getFilter("businesses-layer");

    const propertyFilter = filterEntries?.find((filterEntry) =>
      JSON.stringify(filterEntry).includes(property)
    );

    return propertyFilter;
  }

  /**
   * Styles map circles according to provided business age.
   * @param {number} businessAge
   * @returns void
   */
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
      "#ffffff"
    );

    this.map.setPaintProperty("businesses-layer", "circle-stroke-opacity", [
      "case",
      ["==", 0, ["-", ["get", BUSINESSES_TILESET_PROPERTIES.age], businessAge]],
      1,
      0,
    ]);
  }

  /**
   *
   * @param {*} filter
   * @returns void
   */
  renderedBusinesses(filter) {
    return this.map.queryRenderedFeatures({
      layers: ["businesses-layer"],
      filter: filter,
    });
  }

  /**
   * Queries the rendered features and sends them to the visualization (via a Stimulus outlet)
   * @param {{age: number}} options
   * @returns void
   */
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

  /**
   * Toggles the map interactions on or off.
   * @param {{on: Boolean}} options
   * @returns void
   */
  toggleInteractions({ on = false }) {
    if (!this.map) return;

    const MAP_INTERACTIONS = [
      "scrollZoom",
      "boxZoom",
      "dragRotate",
      "dragPan",
      "keyboard",
      "doubleClickZoom",
      "touchZoomRotate",
    ];

    if (on) {
      MAP_INTERACTIONS.forEach((interaction) => this.map[interaction].enable());
    } else {
      MAP_INTERACTIONS.forEach((interaction) =>
        this.map[interaction].disable()
      );
    }
  }

  /**
   * Creates the HTML for a table element presenting business branch and inception year.
   * @param {*} features GeoJSON feature object array
   * @param {String[]} headers
   * @returns HTMLTableElement
   */
  createPopupTable(features, headers) {
    const table = document.createElement("table");

    if (headers) {
      const branchHead = document.createElement("th");
      branchHead.textContent = "Branche";

      const inceptionYear = document.createElement("th");
      inceptionYear.textContent = "Gründungsjahr";

      const thead = document.createElement("thead");

      const tr = document.createElement("tr");
      const theadRow = thead.appendChild(tr);
      theadRow.appendChild(branchHead);
      theadRow.appendChild(inceptionYear);

      table.appendChild(thead);
    }

    const tbody = document.createElement("tbody");

    features.map((feature) => {
      const tr = document.createElement("tr");
      const branch = document.createElement("td");
      branch.textContent = feature.properties.ihk_branch_desc;

      const year = document.createElement("td");
      year.textContent = getBusinessInceptionYear(
        feature.properties.business_age
      );

      tr.appendChild(branch);
      tr.appendChild(year);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    return table;
  }
}
