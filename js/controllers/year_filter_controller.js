import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js";

export default class extends Controller {
  static targets = ["input", "label", "toggle"];

  static outlets = ["map"];

  connect() {
    this.updateYearLabel(this.selectedYear);
  }

  inputTargetConnected(element) {
    this.slChangeListener = element.addEventListener("sl-change", (event) => {
      this.updateYearLabel(event.target.value);

      const selectedYear = parseInt(event.target.value, 10);
      const selectedAge = this.maxYear - selectedYear;
      this.sendToOutlets(selectedAge);
    });
  }

  inputTargetDisconnected(element) {
    element.removeEventListener("sl-change", this.slChangeListener);
  }

  toggleTargetConnected(element) {
    this.clickListener = element.addEventListener("click", (event) => {
      this.toggleAutoplay(event);
    });
  }

  toggleTargetDisconnected(element) {
    element.removeEventListener("click", this.clickListener);
  }

  sendToOutlets(selectedAge) {
    this.mapOutlet.updateFilters({ minAge: selectedAge });
    this.mapOutlet.sendBusinessesToViz({ age: selectedAge });
  }

  updateYearLabel(year) {
    this.labelTarget.textContent = year;
  }

  toggleAutoplay(event) {
    const currentlyPlaying = event.currentTarget.dataset.playing === "true";

    if (currentlyPlaying) {
      this.stopAdvancingYear();
      event.currentTarget.dataset.playing = false;
    } else {
      this.advanceYear();
      event.currentTarget.dataset.playing = true;
    }
  }

  advanceYear() {
    if (this.inputTarget.value === this.maxYear) return;

    this.yearInterval = setInterval(() => {
      if (this.inputTarget.value === this.maxYear) {
        this.stopAdvancingYear();
        return;
      }

      const newYear = parseInt(this.inputTarget.value, 10) + 1;
      this.inputTarget.value = newYear;

      this.sendToOutlets(this.maxYear - newYear);
      this.updateYearLabel(newYear);
    }, 1200);

    this.mapOutlet.toggleInteractions({ on: false });
    this.toggleTarget.setAttribute("name", "pause");
    this.toggleTarget.setAttribute("label", "Zeitstrahl pausieren");
  }

  stopAdvancingYear() {
    if (this.yearInterval) {
      clearInterval(this.yearInterval);
    }

    this.mapOutlet.toggleInteractions({ on: true });
    this.toggleTarget.setAttribute("name", "play");
    this.toggleTarget.setAttribute("label", "Zeitstrahl aktivieren");
  }

  get maxYear() {
    return parseInt(this.inputTarget.getAttribute("max"), 10);
  }

  get selectedYear() {
    return parseInt(this.inputTarget.value, 10);
  }

  get selectedAge() {
    return this.maxYear - this.selectedYear;
  }
}
