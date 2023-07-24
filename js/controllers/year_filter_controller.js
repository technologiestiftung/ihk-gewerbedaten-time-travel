import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

export default class extends Controller {
  static targets = ["input", "label", "toggle"];

  static outlets = ["map"];

  connect() {
    this.updateYearLabel(this.initialYear);
  }

  change(event) {
    this.updateYearLabel(event.target.value);

    const selectedYear = parseInt(event.target.value, 10);
    const minBusinessAge = this.maxYear - selectedYear;
    this.sendToMap(minBusinessAge);
  }

  sendToMap(minAge) {
    this.mapOutlet.updateFilters({ minAge });
    this.mapOutlet.sendBusinessesToViz();
  }

  updateYearLabel(year) {
    this.labelTarget.textContent = year;
  }

  toggleAutoplay(event) {
    const currentlyPlaying = event.params.playing;

    if (currentlyPlaying) {
      this.stopAdvancingYear();
      event.target.dataset.yearFilterPlayingParam = false;
    } else {
      this.advanceYear();
      event.target.dataset.yearFilterPlayingParam = true;
    }
  }

  advanceYear() {
    this.yearInterval = setInterval(() => {
      const newYear = parseInt(this.inputTarget.value, 10) + 1;

      if (newYear === this.maxYear) this.stopAdvancingYear();

      this.sendToMap(this.maxYear - newYear);
      this.updateYearLabel(newYear);
      this.inputTarget.value = newYear;
    }, 800);

    this.toggleTarget.textContent = "Pause";
  }

  stopAdvancingYear() {
    if (this.yearInterval) {
      clearInterval(this.yearInterval);
    }
    this.toggleTarget.textContent = "Play";
  }

  get maxYear() {
    return parseInt(this.inputTarget.getAttribute("max"), 10);
  }

  get initialYear() {
    return this.inputTarget.value;
  }
}
