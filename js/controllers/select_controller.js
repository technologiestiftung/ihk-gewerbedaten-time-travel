import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";
import {
  getSelectedAge,
  replaceUnderscoresWithSpaces,
} from "../utils/businesses-util.js";

export default class extends Controller {
  static outlets = ["map", "viz"];

  connect() {
    this.slChangeListener = this.element.addEventListener(
      "sl-change",
      (event) => {
        this.mapOutlet.updateFilters({
          branch: replaceUnderscoresWithSpaces(event.target.value),
        });
        this.mapOutlet.sendBusinessesToViz({ age: getSelectedAge() });
      }
    );
  }

  disconnect() {
    this.element.removeEventListener("sl-change", this.slChangeListener);
  }
}
