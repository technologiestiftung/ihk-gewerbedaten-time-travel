import { Application } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";
import YearFilterController from "./controllers/year_filter_controller.js";
import SelectController from "./controllers/select_controller.js";
import MapController from "./controllers/map_controller.js";

window.Stimulus = Application.start();

Stimulus.register("year-filter", YearFilterController);
Stimulus.register("select", SelectController);
Stimulus.register("map", MapController);
