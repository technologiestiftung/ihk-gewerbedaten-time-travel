import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";
import { getSelectedAge } from "../utils/businesses-util.js";

export default class extends Controller {
  static outlets = ["map", "viz"];

  change(event) {
    this.mapOutlet.updateFilters({ branch: event.target.value });
    this.mapOutlet.sendBusinessesToViz({ age: getSelectedAge() });
  }
}
