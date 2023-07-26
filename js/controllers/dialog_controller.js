import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js";

export default class extends Controller {
  static targets = ["dialog"];

  show() {
    this.dialogTarget.show();
  }

  hide() {
    this.dialogTarget.hide();
  }
}
