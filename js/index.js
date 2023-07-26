import { Application } from "https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js";
import YearFilterController from "./controllers/year_filter_controller.js";
import SelectController from "./controllers/select_controller.js";
import MapController from "./controllers/map_controller.js";
import VizController from "./controllers/viz_controller.js";
import DialogController from "./controllers/dialog_controller.js";

// Shoelace UI components:
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.5.2/cdn/shoelace.js";

window.Stimulus = Application.start();

Stimulus.register("year-filter", YearFilterController);
Stimulus.register("select", SelectController);
Stimulus.register("map", MapController);
Stimulus.register("viz", VizController);
Stimulus.register("dialog", DialogController);
