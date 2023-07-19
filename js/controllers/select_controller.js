import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

export default class extends Controller {
  static outlets = ["map"];

  change(event) {
    this.mapOutlet.updateFilters({ branch: event.target.value });
  }
}
